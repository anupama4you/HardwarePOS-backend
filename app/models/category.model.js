const pool = require('../models/db');

const Category = function(category) {};

Category.getAllCategories = async () => {
    const result = await new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
        if (err) {
            reject(err);
        }
        connection.query('select * from category;', (customerGetErr, customerGetResult) => {
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

Category.addCategory = async ({
    catName
  }) => {
    const result = await new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        }
        connection.query(
            `insert into category (name) values ('${catName}');`,
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

module.exports = Category;