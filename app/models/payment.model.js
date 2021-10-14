const pool = require('../models/db');


  const Payment = function(payment) {};

  Payment.addPayment = async (payment, res) => {
    const result = await Payment.addPaymentQuery(payment);
    if (result.affectedRows > 0) {
      result.code = 200;
    } else {
      result.code = 100;
    }
    console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxx ', result.code);
    return result;
  }

  Payment.addPaymentQuery = async ({
    date, remark, amount, type, custOrderId, checqueNo, checqueDate,
  }) => {
    console.log(date, remark, amount, type, custOrderId, checqueNo, checqueDate);
    const result = await new Promise((resolve, reject) => {
      pool.getConnection(async (err, connection) => {
        if (err) {
          reject(err);
        }
        connection.query(
          'INSERT INTO customer_payment VALUES (null,?,?,?,?,?,?,?)',
          [
            date,
            remark,
            amount,
            type,
            custOrderId,
            checqueNo,
            checqueDate,
          ],
          (paymentAddErr, paymentAddResult) => {
            if (paymentAddErr) {
              reject(paymentAddErr);
            } else {
              resolve(paymentAddResult);
            }
          },
        );
        connection.query(
          `update customer_order co set co.customer_order_paid = (co.customer_order_paid+${amount})
          where co.idcustomer_order =${custOrderId}`,
          (paymentAddErr, paymentAddResult) => {
            connection.release();
            if (paymentAddErr) {
              reject(paymentAddErr);
            } else {
              resolve(paymentAddResult);
            }
          },
        );
      });
    });
    return result;
  };

  Payment.addReturnItemQuery = async ({
    custOrderId, batchId, date, qty, status,
  }) => {
    const batch = await getBatchByIdQuery(batchId);
    const result = await new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        }
        connection.beginTransaction(async (errTransaction) => {
          if (errTransaction) { reject(errTransaction); }
          connection.query(
            `insert into item_return values(null, ${custOrderId},
              ${batchId}, '${date}', ${qty},${batch[0].selling_price * qty},
              ${batch[0].selling_price * qty})`,
            (returnItemErr, returnItemResult) => {
              if (returnItemErr) {
                reject(returnItemErr);
                return connection.rollback(() => {
                  reject(returnItemErr);
                });
                // eslint-disable-next-line eqeqeq
              } else if (status == 1) {
                connection.query(
                  `update batch set qty = (qty+${qty}) where batch_id = ${batchId}`,
                  (batchUpdateErr) => {
                    if (batchUpdateErr) {
                      reject(batchUpdateErr);
                      return connection.rollback(() => {
                        reject(batchUpdateErr);
                      });
                    }
                    // eslint-disable-next-line no-param-reassign
                    returnItemResult.code = 200;
                    console.log(returnItemResult);
                    return resolve(returnItemResult);
                  },
                );
              } else {
                // eslint-disable-next-line no-param-reassign
                returnItemResult.code = 200;
                console.log(returnItemResult);
                return resolve(returnItemResult);
              }
              // commit db
              connection.commit(async (errCommit) => {
                if (errCommit) {
                  connection.rollback(() => {
                    reject(errCommit);
                  });
                }
                connection.release();
              });
            },
          );
        });
      });
    });
    return result;
  };

  const getBatchByIdQuery = async (batchId) => {
    const result = await new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        }
        connection.query(
          `SELECT * FROM batch WHERE batch_id =${batchId}`,
          (batchErr, batchResult) => {
            connection.release();
            if (batchErr) {
              reject(batchErr);
            } else {
              resolve(batchResult);
            }
          },
        );
      });
    });
    return result;
  };


module.exports = Payment;