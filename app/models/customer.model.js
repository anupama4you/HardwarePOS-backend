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

  module.exports = Customer;