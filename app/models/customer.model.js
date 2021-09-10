const pool = require('../models/db');

const Customer = function(customer) {};

Customer.addCustomerQuery = async ({
    customer_name, customer_address, customer_nic, customer_mobile, customer_discount,
  }) => {
    const result = await new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        }
        connection.query(
          `INSERT INTO customer VALUES (null,'${customer_name}',
        '${customer_address}','${customer_nic}',${customer_mobile},'${customer_discount}')`,
          (customerAddErr, customerAddResult) => {
            connection.release();
            if (customerAddErr) {
              resolve(customerAddErr);
            } else {
              console.log(customerAddResult);
              // eslint-disable-next-line
              customerAddResult.code = 200;
              resolve(customerAddResult);
            }
          },
        );
      });
    });
    return result;
  };
  
  
  Customer.editCustomerQuery = async ({
    idcustomer,
    customer_name, customer_address, customer_nic, customer_mobile, customer_discount,
  }) => {
    const result = await new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        }
        connection.query(
          `UPDATE customer SET customer_name='${customer_name}',customer_address='${customer_address}',customer_nic='${customer_nic}',customer_mobile='${customer_mobile}',customer_discount='${customer_discount}' where idcustomer =${idcustomer}`,
          (customerEditErr, customerEditResult) => {
            connection.release();
            if (customerEditErr) {
              resolve(customerEditErr);
            } else {
              console.log(customerEditResult);
              // eslint-disable-next-line
                customerEditResult.code = 200;
              resolve(customerEditResult);
            }
          },
        );
      });
    });
    return result;
  };
  
  
  Customer.getCustomerQuery = async (customerId) => {
    const result = await new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        }
        connection.query(`SELECT * from customer where idcustomer =${customerId}`, (customerGetErr, customerGetResult) => {
          connection.release();
          if (customerGetErr) {
            reject(customerGetErr);
          } else {
            resolve(customerGetResult);
          }
        });
      });
    });
    return result;
  };
  
  Customer.getAllCustomerQuery = async () => {
    const result = await new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        }
        connection.query('SELECT * from customer', (customerGetErr, customerGetResult) => {
          connection.release();
          if (customerGetErr) {
            reject(customerGetErr);
          } else {
            resolve(customerGetResult);
          }
        });
      });
    });
    return result;
  };
  
  Customer.deleteCustomerQuery = async (customerId) => {
    const result = await new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        }
        connection.query(`DELETE from customer where idcustomer =${customerId}`, (customerDeleteErr, customerDeleteResult) => {
          connection.release();
          if (customerDeleteErr) {
            reject(customerDeleteErr);
          } else {
            resolve(customerDeleteResult);
          }
        });
      });
    });
    return result;
  };

  Customer.addCustomerOrder = async (supplyOrder, res) => {
    const {
      date,
      total,
      paid,
      customerId,
      batches,
      orderDiscount,
      orderStatus,
      checqueNo,
      checqueDate,
      customerOrderCreditRate,
    } = supplyOrder;
    // console.log(supplyOrder);
    // save customer order
    try {
      let result = await new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
          if (err) {
            reject(err);
          }
          connection.beginTransaction(async (errTransaction) => {
            if (errTransaction) { reject(errTransaction); }
            const customerOrderLastId = await new Promise((resolve2, reject2) => {
              let sql = '';
              if (orderStatus == 0) {
                sql = `select * from customer_order
                  where order_status = 0
                  order by idcustomer_order desc limit 1`;
              } else {
                sql = `select * from customer_order
                  where order_status != 0
                  order by idcustomer_order desc limit 1`;
              }
              connection.query(
                sql,
                (customerOrderLastIdErr, customerOrderLastIdResult) => {
                  // console.log(sql);
                  if (customerOrderLastIdErr) {
                    return connection.rollback(() => {
                      reject2(customerOrderLastIdErr);
                    });
                  }
                  if (!customerOrderLastIdResult[0].idcustomer_order) {
                    resolve2(1);
                  } else {
                    let lastNo = customerOrderLastIdResult[0].invoice_no.substring(3);
                    // console.log('lastNo ', lastNo);
                    resolve2(++lastNo);
                  }
                }
              );
            });
            let invNo = '';
            if (orderStatus == 0) {
              invNo = 'QT_' + customerOrderLastId;
            } else {
              invNo = 'IV_' + customerOrderLastId;
            }
            // console.log('invNo ', invNo);
            connection.query(
              'INSERT INTO customer_order(idcustomer_order, customer_order_date, customer_order_total, customer_order_paid, customer_idcustomer, order_discount, order_status, customer_order_credit, invoice_no) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [null, date, total, 0, customerId, orderDiscount,
                orderStatus, customerOrderCreditRate, invNo],
              async (error, results) => {
                if (error) {
                  return connection.rollback(() => {
                    reject(error);
                  });
                }
                // save order details
                result = await new Promise((batchResolve) => {
                  let i = 1;
                  batches.forEach(async (item) => {
                    await new Promise((unitLengthResolve) => {
                      // eslint-disable-next-line eqeqeq
                      if (item.unitLength && item.unitLength != 0 && item.subQty != 0) {
                        // eslint-disable-next-line no-param-reassign
                        const v1 = ((100 / item.unitLength) * item.subQty) / 100;
                        // eslint-disable-next-line no-param-reassign
                        item.qty = (item.qty * 1) + v1;
                        connection.query(
                          `update item i, batch b
                          set i.length = ?
                          where i.item_id = b.item_item_id
                          and b.batch_id = ?`,
                          [item.unitLength, item.batchId],
                          (errorItemLength) => {
                            if (errorItemLength) {
                              connection.release();
                              return connection.rollback(() => {
                                reject(error);
                              });
                            }
                            return unitLengthResolve(1);
                          },
                        );
                      } else {
                        return unitLengthResolve(0);
                      }
                    });
                    connection.query(
                      `select * from batch b                        
                      where b.batch_id = ?`,
                      [item.batchId],
                      (errorBatchQty, resultBatchQty) => {
                        if (resultBatchQty[0].qty < item.qty) {
                          connection.release();
                          return connection.rollback(() => {
                            reject(item);
                          });
                        }
                        connection.query(
                          'INSERT INTO `customer_order_has_batch`(`customer_order_idcustomer_order`, `batch_batch_id`, `customer_order_has_batch_qty`, item_discount, item_total) VALUES (?, ?, ?, ?, ?)',
                          [results.insertId, item.batchId, item.qty, item.discount, item.total],
                          (OrderDetailerror) => {
                            if (OrderDetailerror) {
                              // connection.release();
                              return connection.rollback(() => {
                                reject(OrderDetailerror);
                              });
                            }
                            // update batch remain qty here
                            connection.query(
                              'UPDATE batch SET qty = (qty- ?) WHERE `batch_id` =?',
                              [item.qty, item.batchId],
                              (batchUpdateerror) => {
                                if (batchUpdateerror) {
                                  connection.release();
                                  return connection.rollback(() => {
                                    reject(batchUpdateerror);
                                  });
                                }
                                if (batches.length === i) {
                                  batchResolve(1);
                                }
                                // eslint-disable-next-line no-plusplus
                                i++;
                                return 1;
                              },
                            );
                            return 1;
                          },
                        );
                        if (errorBatchQty) {
                          connection.release();
                          return connection.rollback(() => {
                            reject(errorBatchQty);
                          });
                        }
                      },
                    );
                  });
                });
                connection.query(
                  'select * from customer_order co where co.idcustomer_order = ?',
                  [results.insertId],
                  (getOrderrror, getOrderResult) => {
                    if (getOrderrror) {
                      connection.release();
                      return connection.rollback(() => {
                        reject(getOrderrror);
                      });
                    }
                    // commit db
                    connection.commit(async (errCommit) => {
                      if (errCommit) {
                        connection.release();
                        connection.rollback(() => {
                          reject(errCommit);
                        });
                      }
                      connection.release();
                      const customer = await getCustomerQuery({ customerId });
                      const response = {
                        code: 200, status: 'Success',
                        orderId: results.insertId,
                        invoice_no: getOrderResult[0].invoice_no,
                        customer,
                      };
                      resolve(response);
                      return 1;
                    });
                    return 0;
                  },
                );
              },
            );
          });
        });
      });
      console.log('11111111111111111111111111111111111 ');
      console.log(result);
      const customerDebit =
        await getReturnDebitByCustomerQuery(customerId);
      if (customerDebit[0].debit) {
        if (customerDebit[0].debit > total) {
          // 1. add total as payment
          addPaymentQuery({
            date,
            remark: 'Debit Balance',
            amount: total,
            type: 3,
            custOrderId: result.orderId,
            checqueNo,
            checqueDate: null,
          });
          // 2. update remain balance
          //    2.1 get debit rows
          const returns = await getReturnsByCustomerQuery(customerId);
          let usedBalance = total;
          // eslint-disable-next-line no-plusplus
          for (let i = 0; i < returns.length; i++) {
            if (usedBalance > returns[i].debit_balance) {
              updateDebitBalanceByIdQuery({
                itemReturnId: returns[i].iditem_return, debitBalance: 0,
              });
              usedBalance -= returns[i].debit_balance;
            } else {
              updateDebitBalanceByIdQuery({
                itemReturnId: returns[i].iditem_return,
                debitBalance: (returns[i].debit_balance - usedBalance),
              });
              break;
            }
          }
        } else {
          // 1. add debit as payment
          addPaymentQuery({
            date,
            remark: 'Debit Balance',
            amount: customerDebit[0].debit,
            type: 3,
            custOrderId: result.orderId,
            checqueNo,
            checqueDate,
          });
          // 2. set all debit to 0
          const returns = await getReturnsByCustomerQuery(customerId);
          // eslint-disable-next-line no-plusplus
          for (let i = 0; i < returns.length; i++) {
            updateDebitBalanceByIdQuery({ itemReturnId: returns[i].iditem_return, debitBalance: 0 });
          }
        }
      }
      if (paid > 0) {
        addPaymentQuery({
          date,
          remark: 'Initial Payment',
          amount: paid,
          type: 1,
          custOrderId: result.orderId,
          checqueNo,
          checqueDate,
        });
      }
      return (result);
    } catch (e) {
      console.log('error catch');
      console.log(e);
      return e;
    }
    
    // save order details with batch id
  };
  
  Customer.getReturnDebitByCustomerQuery = async (customerId) => {
    const result = await new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        }
        connection.query(
          `select sum(ir.debit_balance) as debit
          from customer_order co, item_return ir
          where ir.customer_order_has_batch_customer_order_idcustomer_order = co.idcustomer_order
          and co.customer_idcustomer =${customerId}
          and ir.debit_balance != 0`,
          (returnDebitErr, returnDebitResult) => {
            connection.release();
            if (returnDebitErr) {
              reject(returnDebitErr);
            } else {
              resolve(returnDebitResult);
            }
          },
        );
      });
    });
    return result;
  };

  module.exports = Customer;