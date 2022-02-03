const pool = require('../../db_config/db');
const firebase = require('../controllers/user.firebase')
const userModel = require('../models/user.model')

const CustomerOrder = function(customerorder) {};

CustomerOrder.getOrdersByCustomerId =  async (customerId, idToken, user_id) => {
    const authUser = await firebase.verifyIdToken(idToken);
    const userId = authUser;
    console.log(customerId,'8****')
    const user = await userModel.findByFirebaseId(userId);
    const result = await new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        }
        let sql = `select * from customer_order co where co.customer_idcustomer =${customerId}`;
        if (user && user[0].user_role_type && user[0].user_role_type === 2) {
          sql += ` and co.order_status != 0 and co.user_id='${user_id}' `;
        }
        sql += ' order by co.idcustomer_order desc';
        connection.query(sql, (customerDeleteErr, customerDeleteResult) => {
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

 CustomerOrder.getOrderDetailsByCustomerOrderId = async (customerOrderId) => {
    const result = await new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        }
        connection.query(
          `select *,
          FLOOR(cob.customer_order_has_batch_qty ) as qty,
          TRUNCATE(substring(cob.customer_order_has_batch_qty, -2 )/100*i.length,0) as subQty
          from customer_order_has_batch cob, batch b, item i
          where cob.customer_order_idcustomer_order = ${customerOrderId}
          and cob.batch_batch_id=b.batch_id
          and b.item_item_id = i.item_id `,
          (customerDeleteErr, customerDeleteResult) => {
            connection.release();
            if (customerDeleteErr) {
              reject(customerDeleteErr);
            } else {
              resolve(customerDeleteResult);
            }
          },
        );
      });
    });
    return result;
  };

 CustomerOrder.updateCustomerOrderById = async () => {
    const result = await new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        }
        connection.query('select * from customer_order', (customerOrderErr, customerOrderResult) => {
          if (customerOrderErr) {
            reject(customerOrderErr);
          } else {
            let qt = 1;
            let iv = 1;
            for (let i = 0; i < customerOrderResult.length; i++) {
              let sql = '';
              if (customerOrderResult[i].order_status === 0) {
                sql = `update customer_order co
                  set co.invoice_no = 'QT_${qt}'
                  where co.idcustomer_order = ?
                  `;
                qt++;
              } else {
                sql = `update customer_order co
                  set co.invoice_no = 'IV_${iv}'
                  where co.idcustomer_order = ?
                  `;
                iv++;
              }
              connection.query(
                sql, [customerOrderResult[i].idcustomer_order],
                (customerOrderUpdateErr, customerOrderUpdateResult) => {
                  if ((i + 1) == customerOrderResult.length) {
                    console.log('customerOrderUpdateResult', customerOrderUpdateResult);
                    connection.release();
                  }
                  if (customerOrderUpdateErr) {
                    reject(customerOrderUpdateErr);
                  }
                },
              );
            }
          }
        });
      });
    });
    return result;
  };

  CustomerOrder.getCustomerOrdersByDates = async ({
    customerId, fromDate, toDate
    }, res) => {
       
      const fromDateF = fromDate+' 00:00:00'
      const toDateF = toDate+' 23:59:59'

    const result = await new Promise((resolve, reject) => { 
    pool.getConnection((err, connection) => {
      if (err) throw err;
      connection.query(`SELECT * from customer_order where customer_idcustomer = '${customerId}' and 	customer_order_date >= '${fromDateF}' and customer_order_date <= '${toDateF}'`, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          console.log(rows)
          resolve(rows);
        }
      });
      connection.release();
    });
    });
    return result;
  };

module.exports = CustomerOrder;