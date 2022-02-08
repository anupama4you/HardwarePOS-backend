const sql = require('../../db_config/db');
const Payment = require('../models/payment.model')
const ReturnItem = require('../models/returnItem.model')

const Customer = function (customer) {};

Customer.addCustomerQuery = async ({
    customer_name, customer_address, customer_nic, customer_mobile, customer_discount,
  }) => {
    const result = await new Promise((resolve, reject) => {
      sql.query(
        `INSERT INTO customer VALUES (null,'${customer_name}',
      '${customer_address}','${customer_nic}',${customer_mobile},'${customer_discount}')`,
        (err, res) => {
          if (err) {
            throw err;
          } else {
            console.log(res);
            res.code = 200;
            resolve(res);
          }
        },
      );
    });
    return result;
  };
  
  
  Customer.editCustomerQuery = async ({
    idcustomer,
    customer_name, customer_address, customer_nic, customer_mobile, customer_discount,
  }) => {
    const result = await new Promise((resolve, reject) => {
      sql.query(
        `UPDATE customer SET customer_name='${customer_name}',customer_address='${customer_address}',customer_nic='${customer_nic}',customer_mobile='${customer_mobile}',customer_discount='${customer_discount}' where idcustomer =${idcustomer}`,
        (err, res) => {
          if (err) {
            throw err
          } else {
            console.log(res);
            res.code = 200;
            resolve(res);
          }
        },
      );
    });
    return result;
  };
  
  
  Customer.getCustomerQuery = async (customerId) => {
    const result = await new Promise((resolve, reject) => {
      sql.query(`SELECT * from customer where idcustomer =${customerId}`,
       (err, res) => {
        if (err) {
          throw err;
        } else {
          resolve(res);
        }
      });
    });
    return result;
  };
  
  Customer.getAllCustomerQuery = async () => {
    const result = await new Promise((resolve, reject) => {
      sql.query('SELECT * from customer', (err, res) => {
        if (err) {
          throw err;
        } else {
          resolve(res);
        }
      });
    });
    return result;
  };
  
  Customer.deleteCustomerQuery = async (customerId) => {
    const result = await new Promise((resolve, reject) => {
      sql.query(`DELETE from customer where idcustomer =${customerId}`, 
      (err, res) => {
        if (err) {
          throw err;
        } else {
          resolve(res);
        }
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
      user_id
    } = supplyOrder;
    // console.log(supplyOrder);
    // save customer order
    let result = null;
    try {
      result = await new Promise((resolve, reject) => {
        sql.beginTransaction(async (err) => {
          if (err) { throw err; }
          const customerOrderLastId = await new Promise((resolve2, reject2) => {
            let sql_query = '';
            if (orderStatus == 0) {
              sql_query = `select * from customer_order
                where order_status = 0
                order by idcustomer_order desc limit 1`;
            } else {
              sql_query = `select * from customer_order
                where order_status != 0
                order by idcustomer_order desc limit 1`;
            }
            sql.query(
              sql_query,
              (err, res) => {
                // console.log(sql);
                if (err) {
                  return sql.rollback(() => {
                    throw err;
                  });
                }
                  
                if (res && !res[0]) {
                  resolve2(1);
                } else {
                  let lastNo = res[0].invoice_no.substring(3);
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
          sql.query(
            'INSERT INTO customer_order(idcustomer_order, customer_order_date, customer_order_total, customer_order_paid, customer_idcustomer, order_discount, order_status, customer_order_credit, invoice_no, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [null, date, total, 0, customerId, orderDiscount,
              orderStatus, customerOrderCreditRate, invNo, user_id],
            async (error, results) => {
              if (error) {
                return sql.rollback(() => {
                  throw error;
                });
              }
              // save order details
              result = await new Promise((batchResolve) => {
                let i = 1;
                batches.forEach(async (item) => {
                  await new Promise((unitLengthResolve) => {
                    // eslint-disable-next-line eqeqeq
                    if (item.unitLength && item.unitLength != 0 && item.subQty != 0) {

                      console.log(item.unitLength, item.subQty)

                      // eslint-disable-next-line no-param-reassign
                      const percentageSubQty = ((100 / item.unitLength) * item.subQty) / 100; 

                      console.log(item.unitLength, item.subQty)

                      console.log(percentageSubQty)

                      // eslint-disable-next-line no-param-reassign
                      item.qty = (item.qty * 1) + percentageSubQty;

                      console.log(item.qty)

                      sql.query(
                        `update item i, batch b
                        set i.length = ?
                        where i.item_id = b.item_item_id
                        and b.batch_id = ?`,
                        [item.unitLength, item.batchId],
                        (err) => {
                          console.log(item.batchId)
                          if (err) {                    
                            return sql.rollback(() => {
                              throw err;
                            });
                          }
                          return unitLengthResolve(1);
                        },
                      );
                    } else {
                      return unitLengthResolve(0);
                    }
                  });
                  sql.query(
                    `select * from batch b                        
                    where b.batch_id = ?`,
                    [item.batchId],
                    (err, res) => {
                      console.log('***blah***', res[0].qty, item.qty)
                      if (res[0].qty < item.qty) {
                        return sql.rollback(() => {
                          reject(item);
                        });
                      }
                      sql.query(
                        'INSERT INTO `customer_order_has_batch`(`customer_order_idcustomer_order`, `batch_batch_id`, `customer_order_has_batch_qty`, item_discount, item_total) VALUES (?, ?, ?, ?, ?)',
                        [results.insertId, item.batchId, item.qty, item.discount, item.total],
                        (err) => {
                          if (err) {
                            return sql.rollback(() => {
                              throw err;
                            });
                          }

                          console.log('*****ANU****',item.qty)

                          // update batch remain qty here
                          sql.query(
                            'UPDATE batch SET qty = (qty- ?) WHERE `batch_id` =?',
                            [item.qty, item.batchId],
                            (err) => {
                              console.log('***Batch ID:',item.batchId)
                              if (err) {
                                return sql.rollback(() => {
                                  reject(err);
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
                      
                      if (err) {
                        return sql.rollback(() => {
                          throw err;
                        });
                      }
                    },
                  );
                });
              });
              sql.query(
                'select * from customer_order co where co.idcustomer_order = ?',
                [results.insertId],
                (err, res) => {
                  if (err) {
                    return sql.rollback(() => {
                      reject(err);
                    });
                  }
                  // commit db
                  sql.commit(async (err) => {
                    if (err) {
                      sql.release();
                      sql.rollback(() => {
                        reject(err);
                      });
                    }
                    const customer = await Customer.getCustomerQuery(customerId);
                    const response = {
                      code: 200, status: 'Success',
                      orderId: results.insertId,
                      invoice_no: res[0].invoice_no,
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
      console.log('11111111111111111111111111111111111 ');
      console.log(result);
      const customerDebit =
        await ReturnItem.getReturnDebitByCustomerQuery(customerId);
      if (customerDebit[0].debit) {
        if (customerDebit[0].debit > total) {
          // 1. add total as payment
          Payment.addPaymentQuery({
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
          const returns = await  ReturnItem.getReturnsByCustomerQuery(customerId);
          let usedBalance = total;
          // eslint-disable-next-line no-plusplus
          for (let i = 0; i < returns.length; i++) {
            if (usedBalance > returns[i].debit_balance) {
             await ReturnItem.updateDebitBalanceByIdQuery({
                itemReturnId: returns[i].iditem_return, debitBalance: 0,
              });
              usedBalance -= returns[i].debit_balance;
            } else {
              await ReturnItem.updateDebitBalanceByIdQuery({
                itemReturnId: returns[i].iditem_return,
                debitBalance: (returns[i].debit_balance - usedBalance),
              });
              break;
            }
          }
        } else {
          // 1. add debit as payment
          Payment.addPaymentQuery({
            date,
            remark: 'Debit Balance',
            amount: customerDebit[0].debit,
            type: 3,
            custOrderId: result.orderId,
            checqueNo,
            checqueDate,
          });
          // 2. set all debit to 0
          const returns = await ReturnItem.getReturnsByCustomerQuery(customerId);
          // eslint-disable-next-line no-plusplus
          for (let i = 0; i < returns.length; i++) {
            ReturnItem.updateDebitBalanceByIdQuery({ itemReturnId: returns[i].iditem_return, debitBalance: 0 });
          }
        }
      }
      if (paid > 0) {
        Payment.addPaymentQuery({
          date,
          remark: 'Initial Payment',
          amount: paid,
          type: 1,
          custOrderId: result.orderId,
          checqueNo,
          checqueDate,
        });
      }
      return(result);
    } catch (e) {
      console.log('error catch');
      console.log(e);
      return(e);
    }
  
    // save order details with batch id
  };  

module.exports = Customer;
