const pool = require('../models/db');

const Item = function(item) {};

Item.editItemQuery = async ({
    code,
    name,
    qty,
    length,
    description,
    subCategory_id,
    item_id,
    rol,
    isDeleted,
  }) => {
    const result = await new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        }
        connection.query(
          `UPDATE item
          SET
          code = ?,
          name = ?,
          qty = ?,
          length = ?,
          description = ?,
          subCategory_id = ?,
          rol = ?,
          isDeleted = ?
          WHERE item_id = ?
          `,
          [
            code,
            name,
            qty,
            length,
            description,
            // eslint-disable-next-line camelcase
            subCategory_id,
            rol,
            isDeleted ? 1 : 0,
            // eslint-disable-next-line camelcase
            item_id,
          ],
          (customerAddErr, customerAddResult) => {
            connection.release();
            if (customerAddErr) {
              resolve(customerAddErr);
            } else {
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

  Item.getItemByIdQuery = async (item_id) => {
    const result = await new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        }
        connection.query(
          `select * from item
          WHERE item_id = ?
          `,
          [
            item_id,
          ],
          (customerAddErr, customerAddResult) => {
            connection.release();
            if (customerAddErr) {
              resolve(customerAddErr);
            } else {
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

  module.exports = Item; 