const pool = require('../models/db');

const Supplier = function(supplier) {};

Supplier.addSupplier = async ({
    name, desc, phone, address
  }) => {
    const result = await new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        }
        connection.query
        (`insert into supplier (name, contactNo, address, description) values
        ('${name}', '${phone}','${address}','${desc}')`,
          (error, results) => {
            connection.release();
            if (error) {
              resolve(error);
            } else {
              console.log(results);
              // eslint-disable-next-line
              results.code = 200;
              resolve(results);
            }
          },
        );
      });
    });
    return result;
  };

  Supplier.getAllSuppliers = async () => {
    const result = await new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        }
        connection.query('select * from supplier;', (customerGetErr, customerGetResult) => {
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

  Supplier.getSupplier = async (supplierId) => {
    const result = await new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        }
        connection.query(`select * from supplier where supplier_id = '${supplierId}'`, (customerGetErr, customerGetResult) => {
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
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        }
        connection.query(
            `update supplier set name = '${name}', contactNo = '${phone}',
            address = '${address}', description = '${desc}'
            where supplier_id = ${supplierId}`,
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

  Supplier.addSupplyOrder = async (supplyOrder, res) => {
    const {
      date,
      supplireId,
      items,
    } = supplyOrder;
    try {
      const result = await new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
          if (err) {
            reject(err);
          }
          connection.beginTransaction((err) => {
            connection.query(`INSERT INTO supplyorder( date, supplier_id)
              VALUES ('${date}', ${supplireId})`, (error, results) => {
              if (error) {
                return connection.rollback(() => {
                  reject(error);
                });
              }
              if (!items) {
                return connection.rollback(() => {
                  resolve({
                    code: 100,
                    message: 'supplire order must contain items'
                  });
                });
              }
              for (let i = 0; i < items.length; i++) {
                if (!parseInt(items[i].qty)) {
                  return connection.rollback(() => {
                    resolve({ status: 100, message: 'item qty must in double' });
                  });
                }
                connection.query(
                  `SELECT * FROM  batch WHERE  item_item_id =${items[i].id}
                  AND  buying_price =${items[i].buyPrice} AND  selling_price =${items[i].sellPrice}`,
                  (matchingBatchesError, matchingBatches) => {
                    if (matchingBatchesError) {
                      return connection.rollback(() => {
                        reject(matchingBatchesError);
                      });
                    }
                    if (matchingBatches.length > 0) {
                      // found previous batch and update qty of this
                      connection.query(
                        `UPDATE batch SET qty=(qty+${items[i].qty}) WHERE batch_id = ${matchingBatches[0].batch_id}`,
                        (updateBatchError) => {
                          if (updateBatchError) {
                            return connection.rollback(() => {
                              reject(updateBatchError);
                            });
                          }
                          connection.query(
                            `INSERT INTO supplyorder_has_batch
                            VALUES (${results.insertId},${matchingBatches[0].batch_id},${items[i].qty})`,
                            (addSupplyOrderError) => {
                              if (addSupplyOrderError) {
                                return connection.rollback(() => {
                                  reject(addSupplyOrderError);
                                });
                              }
                              if (items.length === i + 1) {
                                connection.commit((commiterr) => {
                                  if (commiterr) {
                                    connection.release();
                                    connection.rollback(() => {
                                      reject(commiterr);
                                    });
                                  }
                                  connection.release();
                                });
                                resolve({ code: 200, status: 'Success' });
                              }
                            }
                          );
                        }
                      );
                    } else {
                      // create new batch here
                      connection.query(
                        `INSERT INTO batch(batch_id, buying_price, selling_price,
                          qty, item_item_id)
                          VALUES (null, ${items[i].buyPrice}, ${items[i].sellPrice},
                             ${items[i].qty}, ${items[i].id})`,
                        (addBatchError, addBatchRes) => {
                          if (addBatchError) {
                            return connection.rollback(() => {
                              reject(addBatchError);
                            });
                          }
                          connection.query(
                            `INSERT INTO supplyorder_has_batch
                            VALUES (${results.insertId},${addBatchRes.insertId},${items[i].qty})`,
                            (addSupplyOrderError) => {
                              if (addSupplyOrderError) {
                                return connection.rollback(() => {
                                  reject(addSupplyOrderError);
                                });
                              }
                              if (items.length === i + 1) {
                                connection.commit((commiterr) => {
                                  if (commiterr) {
                                    connection.release();
                                    connection.rollback(() => {
                                      reject(commiterr);
                                    });
                                  }
                                  connection.release();
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
      });
      return result;
    } catch (e) {
      return e;
    }
  };


module.exports = Supplier;