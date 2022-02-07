const sql = require('../../db_config/db');
const firebase = require('../controllers/user.firebase')
const userModel = require('../models/user.model')

const CustomerOrder = function(customerorder) {};

CustomerOrder.getOrdersByCustomerId =  async (customerId, idToken, user_id) => {
    const authUser = await firebase.verifyIdToken(idToken);
    const userId = authUser;
    console.log(customerId,'8****')
    const user = await userModel.findByFirebaseId(userId);
    const result = await new Promise((resolve, reject) => {
      let sql_query = `select * from customer_order co where co.customer_idcustomer =${customerId}`;
        if (user && user[0].user_role_type && user[0].user_role_type === 2) {
          sql_query += ` and co.order_status != 0 and co.user_id='${user_id}' `;
        }
        sql_query += ' order by co.idcustomer_order desc';
        sql.query(sql_query, (customerDeleteErr, customerDeleteResult) => {
          if (customerDeleteErr) {
            reject(customerDeleteErr);
          } else {
            resolve(customerDeleteResult);
          }
        });
    });
    return result;
  };

 CustomerOrder.getOrderDetailsByCustomerOrderId = async (customerOrderId) => {
    const result = await new Promise((resolve, reject) => {
      sql.query(
        `select *,
        FLOOR(cob.customer_order_has_batch_qty ) as qty,
        TRUNCATE(substring(cob.customer_order_has_batch_qty, -2 )/100*i.length,0) as subQty
        from customer_order_has_batch cob, batch b, item i
        where cob.customer_order_idcustomer_order = ${customerOrderId}
        and cob.batch_batch_id=b.batch_id
        and b.item_item_id = i.item_id `,
        (customerDeleteErr, customerDeleteResult) => {
          if (customerDeleteErr) {
            throw customerDeleteErr;
          } else {
            resolve(customerDeleteResult);
          }
        },
      );
    });
    return result;
  };

 CustomerOrder.updateCustomerOrderById = async () => {
    const result = await new Promise((resolve, reject) => {
      sql.query('select * from customer_order', (customerOrderErr, customerOrderResult) => {
        if (customerOrderErr) {
          throw customerOrderErr;
        } else {
          let qt = 1;
          let iv = 1;
          for (let i = 0; i < customerOrderResult.length; i++) {
            let sql_query = '';
            if (customerOrderResult[i].order_status === 0) {
              sql_query = `update customer_order co
                set co.invoice_no = 'QT_${qt}'
                where co.idcustomer_order = ?
                `;
              qt++;
            } else {
              sql_query = `update customer_order co
                set co.invoice_no = 'IV_${iv}'
                where co.idcustomer_order = ?
                `;
              iv++;
            }
            sql.query(
              sql_query, [customerOrderResult[i].idcustomer_order],
              (customerOrderUpdateErr, customerOrderUpdateResult) => {
                if ((i + 1) == customerOrderResult.length) {
                  console.log('customerOrderUpdateResult', customerOrderUpdateResult);
                  sql.end();
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
    return result;
  };

  CustomerOrder.getCustomerOrdersByDates = async ({
    customerId, fromDate, toDate
    }, res) => {
       
      const fromDateF = fromDate+' 00:00:00'
      const toDateF = toDate+' 23:59:59'

    const result = await new Promise((resolve, reject) => { 
      sql.query(`SELECT * from customer_order where customer_idcustomer = '${customerId}' and 	customer_order_date >= '${fromDateF}' and customer_order_date <= '${toDateF}'`, (err, rows) => {
        if (err) {
          throw err;
        } else {
          console.log(rows)
          resolve(rows);
        }
      });
    });
    return result;
  };

module.exports = CustomerOrder;