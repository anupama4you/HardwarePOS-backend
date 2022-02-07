const sql = require('../../db_config/db');

const Supplier = function(supplier) {};

Supplier.addSupplier = async ({
    name, desc, phone, address
  }) => {
    const result = await new Promise((resolve, reject) => {
      sql.query
        (`insert into supplier (name, contactNo, address, description) values
        ('${name}', '${phone}','${address}','${desc}')`,
          (error, results) => {
            if (error) {
              throw error
            } else {
              console.log(results);
              // eslint-disable-next-line
              // results.code = 200;
              resolve(results);
            }
          },
        );
    });
    return result;
  };

  Supplier.getAllSuppliers = async () => {
    const result = await new Promise((resolve, reject) => {
      sql.query('select * from supplier;', (err, res) => {
        if (err) {
          throw err;
        } else {
          resolve(res);
        }
      });
    });
    return result;
  };

  Supplier.getSupplier = async (supplierId) => {
    const result = await new Promise((resolve, reject) => {
      sql.query(`select * from supplier where supplier_id = '${supplierId}'`, (err, res) => {
        if (err) {
          throw err;
        } else {
          resolve(res);
        }
      });
    });
    return result;
  };

  Supplier.getSupplierByName = async (supplierName) => {
    const result = await new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        }
        connection.query(`SELECT * FROM supplier WHERE name like '%${supplierName}%'`, (customerGetErr, customerGetResult) => {
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

  Supplier.updateSupplier = async ({
    supplierId,
    name, desc, phone, address
  }) => {
    const result = await new Promise((resolve, reject) => {
      sql.query(
        `update supplier set name = '${name}', contactNo = '${phone}',
        address = '${address}', description = '${desc}'
        where supplier_id = ${supplierId}`,
      (err, res) => {
        if (err) {
          throw err;
        } else {
          console.log(res);
          // eslint-disable-next-line
            res.code = 200;
          resolve(res);
        }
      },
    );
    });
    return result;
  };

  Supplier.addSupplyOrder = async (supplyOrder, res) => {
    const {
      date,
      supplierId,
      items,
    } = supplyOrder;
    try {
      const result = await new Promise((resolve, reject) => {
        sql.beginTransaction((err) => {
          sql.query(`INSERT INTO supplyorder( date, supplier_id)
            VALUES ('${date}', ${supplierId})`, (error, results) => {
              console.log('******',results)
            if (error) {
              return connection.rollback(() => {
                reject(error);
              });
            }
            if (!items) {
              return sql.rollback(() => {
                resolve({
                  code: 100,
                  message: 'Supplier order must contain items'
                });
              });
            }
            for (let i = 0; i < items.length; i++) {
              console.log('XXXX')
              if (!parseInt(items[i].qty)) {
                return sql.rollback(() => {
                  resolve({ status: 100, message: 'item qty must in double' });
                });
              }
              sql.query(
                `SELECT * FROM  batch WHERE  item_item_id =${items[i].id}
                AND  buying_price =${items[i].buyPrice} AND  selling_price =${items[i].sellPrice}`,
                (matchingBatchesError, matchingBatches) => {
                  if (matchingBatchesError) {
                    return sql.rollback(() => {
                      reject(matchingBatchesError);
                    });
                  }
                  if (matchingBatches.length > 0) {
                    // found previous batch and update qty of this
                    sql.query(
                      `UPDATE batch SET qty=(qty+?), supply_order_note=? WHERE batch_id = ?`,
                      [items[i].qty, items[i].supplyOrderNote, matchingBatches[0].batch_id] ,
                    (updateBatchError) => {
                        if (updateBatchError) {
                          return sql.rollback(() => {
                            reject(updateBatchError);
                          });
                        }
                        sql.query(
                          `INSERT INTO supplyorder_has_batch
                          VALUES (${results.insertId},${matchingBatches[0].batch_id},${items[i].qty})`,
                          (addSupplyOrderError) => {
                            if (addSupplyOrderError) {
                              return sql.rollback(() => {
                                reject(addSupplyOrderError);
                              });
                            }
                            if (items.length === i + 1) {
                              sql.commit((commiterr) => {
                                if (commiterr) {
                                  sql.release();
                                  sql.rollback(() => {
                                    reject(commiterr);
                                  });
                                }
                              });
                              resolve({ code: 200, status: 'Success' });
                            }
                          }
                        );
                      }
                    );
                  } else {
                    // create new batch here
                    sql.query(
                      `INSERT INTO batch(batch_id, buying_price, selling_price,
                        qty, item_item_id, supply_order_note)
                        VALUES (null, ${items[i].buyPrice}, ${items[i].sellPrice},
                           ${items[i].qty}, ${items[i].id}, '${items[i].supplyOrderNote}' )`,
                      (addBatchError, addBatchRes) => {
                        if (addBatchError) {
                          return sql.rollback(() => {
                            reject(addBatchError);
                          });
                        }
                        
                        sql.query(
                          `INSERT INTO supplyorder_has_batch
                          VALUES (${results.insertId},${addBatchRes.insertId},${items[i].qty})`,
                          (addSupplyOrderError) => {
                            if (addSupplyOrderError) {
                              return sql.rollback(() => {
                                reject(addSupplyOrderError);
                              });
                            }
                            if (items.length === i + 1) {
                              sql.commit((commiterr) => {
                                if (commiterr) {
                                  sql.rollback(() => {
                                    reject(commiterr);
                                  });
                                }
                              });
                              resolve({ code: 200, status: 'Success' });
                            }
                          }
                        );
                      }
                    );
                  }
                }
              );
            }
            // connection.commit((commiterr) => {
            //   if (commiterr) {
            //     connection.release();
            //     connection.rollback(() => {
            //       reject(commiterr);
            //     });
            //   }
            //   connection.release();
            // });
            // resolve({ code: 200, status: 'Success' });
          });
        });
      });
      return result;
    } catch (e) {
      return e;
    }
  };


module.exports = Supplier;