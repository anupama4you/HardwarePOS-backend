const { isError } = require('@sentry/utils');
const sql = require('../../db_config/db');

const SupplierOrder = function(supplierOrder) {};

SupplierOrder.getOrdersBySupplierId = async (supplierId) => {
    const result = await new Promise((resolve, reject) => {
      sql.query(`SELECT * FROM supplyorder WHERE supplier_id = ${supplierId}`, (err, res) => {
        if (err) {
          throw err;
        } else {
          resolve(res);
        }
      });
    });
    return result;
  };

  SupplierOrder.getSupplyOrdersByDates = async ({
    supplierId, fromDate, toDate
    }, res) => {
       
      const fromDateF = fromDate+' 00:00:00'
      const toDateF = toDate+' 23:59:59'

    const result = await new Promise((resolve, reject) => { 
      console.log(fromDateF)
      sql.query(`SELECT * from supplyorder where supplier_id = '${supplierId}' and date >= '${fromDateF}' and date <= '${toDateF}'`, (err, rows) => {
        if (err) {
          throw err;
        } else {
          resolve(rows);
        }
      });
    });
    return result;
  };

  SupplierOrder.getOrderDetailsBySupplierOrderId = async (supOrderId, res) => {
    const result = await new Promise((resolve, reject) => {
      sql.query(`SELECT shb.*,b.buying_price,b.selling_price,i.code,i.description,i.name
        FROM supplyorder_has_batch shb, batch b, item i
        WHERE supplyorder_order_Id = ${supOrderId}
        and shb.batch_batch_id=b.batch_id
        and b.item_item_id = i.item_id `, (err, res) => {
        if (err) {
          throw err;
        } else {
          resolve(res);
        }
      });
    });
    return result;
  };

  SupplierOrder.deleteSupplyOrder = async (supplyOrderId, res) => {
  
    try {
      const result = await new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
          if (err) {
            reject(err);
          }
          connection.beginTransaction((err) => {
            connection.query(`select * from supplyorder so, supplyorder_has_batch shb
               where so.order_id =${supplyOrderId}
              and so.order_Id = shb.supplyorder_order_Id`,
            [supplyOrderId], (error, results) => {
              if (error) {
                return connection.rollback(() => {
                  reject(error);
                });
              }
              if (!results) {
                return connection.rollback(() => {
                  resolve({
                    code: 100,
                    message: 'supplier order must contain items'
                  });
                });
              }
              for (let i = 0; i < results.length; i++) {
                console.log(results[i]);
                connection.query(
                  `update batch set qty = (qty-${results[i].supplyorder_has_batch__qty}) where batch_id = ${results[i].batch_batch_id}`,
                  (addSupplyOrderError) => {
                    if (addSupplyOrderError) {
                      return connection.rollback(() => {
                        reject(addSupplyOrderError);
                      });
                    }
                    if (results.length === i + 1) {
                      connection.query(
                        `delete FROM supplyorder where order_Id = ${supplyOrderId}`,
                        (deleteSupplyOrderError, deleteSupplyOrderResult) => {
                          if (deleteSupplyOrderError) {
                            return connection.rollback(() => {
                              reject(deleteSupplyOrderError);
                            });
                          }
                          connection.commit((commiterr) => {
                            if (commiterr) {
                              connection.rollback(() => {
                                reject(commiterr);
                              });
                            }
                            connection.release();
                          });
                          console.log('deleteSupplyOrderResult ', deleteSupplyOrderResult);
                          resolve({ code: 200, status: 'Success' });
                          return null;
                        },
                      );
                    }
                    return null;
                  },
                );
              }
            },
            );
          });
        });
      });
      return result;
    } catch (e) {
      return e;
    }
  };

module.exports = SupplierOrder;