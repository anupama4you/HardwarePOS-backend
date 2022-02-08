const sql = require('../../db_config/db');

const ReturnItem = function(returnItem) {};

ReturnItem.getReturnDebitByCustomerQuery = async (customerId) => {
    const result = await new Promise((resolve, reject) => {
      sql.query(
        `select sum(ir.debit_balance) as debit
        from customer_order co, item_return ir
        where ir.customer_order_has_batch_customer_order_idcustomer_order = co.idcustomer_order
        and co.customer_idcustomer =${customerId}
        and ir.debit_balance != 0`,
        (err, res) => {
          if (err) {
            throw err;
          } else {
            resolve(res);
          }
        },
      );
    });
    return result;
  };

  ReturnItem.getReturnsByCustomerQuery = async (customerId) => {
    const result = await new Promise((resolve, reject) => {
      sql.query(
        `select ir.*
        from customer_order co, item_return ir
        where ir.customer_order_has_batch_customer_order_idcustomer_order = co.idcustomer_order
        and co.customer_idcustomer =${customerId}
        and ir.debit_balance != 0`,
        (returnDebitErr, returnDebitResult) => {
          if (returnDebitErr) {
            reject(returnDebitErr);
          } else {
            resolve(returnDebitResult);
          }
        },
      );
    });
    return result;
  };

  ReturnItem.updateDebitBalanceByIdQuery = async ({ itemReturnId, debitBalance }) => {
    const result = await new Promise((resolve, reject) => {
      sql.query(
        `update item_return ir set ir.debit_balance = ${debitBalance}
          where ir.iditem_return = ${itemReturnId}`,
        (returnDebitErr, returnDebitResult) => {
          sql.release();
          if (returnDebitErr) {
            reject(returnDebitErr);
          } else {
            resolve(returnDebitResult);
          }
        },
      );
    });
    return result;
  };

module.exports = ReturnItem;
