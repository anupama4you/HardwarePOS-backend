const pool = require('../models/db')
const Item = require('../models/item.model');
const Payment = require('../models/payment.model');

/*********Get all items */
exports.getAllItems = async(req, res) => {
  pool.getConnection((err, connection) => {
    if (err) {
        res.status(100).send({
            message: "Error in connection database"
          });
    }
    connection.query(`select item.item_id, item.code, item.name, item.qty, item.length, item.description, item.isDeleted,
      subcategory.name as subcategory_name, category.name as category_name,
      (select sum(FLOOR(b.qty)) from batch b where b.item_item_id = item.item_id) as qtyOnHand,
      (select TRUNCATE(sum(substring(b.qty, -2 ))/100*item.length,0) from batch b where b.item_item_id = item.item_id) as subQtyOnHand
      from category,
      item inner join subcategory where item.subCategory_id = subcategory.subCat_id and
      subcategory.category_id = category.cat_id;`, (err, rows) => {
      connection.release();
      if (err)
          res.status(500).send({
            message:
              err.message || "Some error occurred while retrieving items."
          });
        else res.send(rows);
    });
  });
};

/*********Add item */
exports.addItem = async (item, res) => {
    const {
      qty,
      length,
      subCategory_id,
      itemcode,
      itemname,
      itemdesc,
    } = item.body;

    console.log(item.body)

    pool.getConnection((err, connection) => {
        if (err) {
            res.status(100).send({
                message: "Error in connection database"
              });
        }
  
      connection.query(`insert into item (code, name, qty, length, description, subCategory_id) values
      ('${itemcode}', '${itemname}',${qty}, ${length}, '${itemdesc}',${subCategory_id});`, (err) => {
        connection.release();
        if (err){
          res.status(500).send({
            message:
              err || "Some error occurred while retrieving items."
          });
        }
        else 
            res.status(200).send({
                message: "Successfully added items"
            });
    });
    });
  };

/*********Edit item*/
exports.editItem = async (item, res) => {
    const result = await Item.editItemQuery(item.body);
    res.send(result);
};

/*********Get 1 item*/
exports.getItemById = async (req, res) => {
    const result = await Item.getItemByIdQuery(req.params.item_id);
    res.send(result);
};

exports.getStockWithBatches = async (req, res) => {
  const result = await Item.getStockWithBatchesQuery();
  res.send(result);
};

exports.getLatestPriceByItemId = async (req, res) => {
  const result = await Item.getLatestPriceByItemIdQuery(req.params.itemId);
  res.send(result);
};

exports.getItemTransactionHistory = async (req, res) => {
  const result = await Item.getItemTransactionHistoryQuery(req.params.itemId);
  res.send(result);
};

exports.getROLReachedItems = async (req, res) => {
  const result = await Item.getROLReachedItems();
  res.send(result);
};

// Return item temp table
exports.addReturnItemTemp = async (req, res) => {
  const {
      custOrderId, batchId, name, date, qty, len, cusOrderQty, status, cusOrSup
    } = req.body;

    // const name1 = '5/16 X 3/8 SINGLE CHANNEL - NATURAL 12ʾ | 374 X 1 0` - 24\%';

  pool.getConnection((err, connection) => {
      if (err) {
          res.status(100).send({
              message: "Error in connection database"
            });
      }

      let duplicate;

    connection.query(
      `SELECT * FROM item_return_temp WHERE cus_order_id ='${custOrderId}' && batch_id='${batchId}' `,
      (batchErr, batchResult) => {
        connection.release();
        if (batchErr) {
          res.status(500).send(batchErr);
        } else {
          console.log(batchResult.length)
          if(batchResult.length == 0){
            duplicate = false;
          }else{
            duplicate = true;
          }

          connection.query(`insert into item_return_temp (cus_order_id, batch_id, name, date, quantity, length, cus_order_qty, order_status, cus_or_sup) values
            ('${custOrderId}', '${batchId}', '${name}', '${date}',${qty}, ${len}, ${cusOrderQty}, ${status}, '${cusOrSup}');`, (err,data) => {
                if (err){
                  console.log(err)
                res.status(500).send(err);
                }
                else {
                  // retrieve the recently inserted record
                  connection.query(`select * from item_return_temp ORDER BY item_return_id DESC LIMIT 1`, (err,data) => {
                          if (err){
                            console.log(err)
                          }
                          else {
                            res.status(200).send({data, isDuplicate: duplicate});
                          }
                              
                      });
                }
                    
            });

        }
      });


  });
};

// Return item temp table
exports.getAllReturnItems = async (req, res) => {
  pool.getConnection((err, connection) => {
      if (err) {
          res.status(100).send({
              message: "Error in connection database"
            });
      }

      const sql = `SELECT * FROM item_return_temp;`
      
      connection.query(sql, async(err,data) => {
          connection.release();
          if (err){
            console.log(err)
          res.status(500).send(err);
          }
          else {
          // console.log(data)
          res.status(200).send(data);
          }   
      });

  });
};

// Return item temp table by customer or supplier
exports.getReturnItems = async (req, res) => {
  pool.getConnection((err, connection) => {
      if (err) {
          res.status(100).send({
              message: "Error in connection database"
            });
      }

      console.log(req.params)

      let sql = ''

      const cusOrSup = req.params.cusOrSup;
      if(cusOrSup == 'supplier' || cusOrSup == 'customer'){
        sql = `SELECT * FROM item_return_temp WHERE cus_or_sup='${cusOrSup}';`
      }else{
        sql = `SELECT * FROM item_return_temp;`
      }
      
      connection.query(sql, async(err,data) => {
          connection.release();
          if (err){
            console.log(err)
          res.status(500).send(err);
          }
          else {
          // console.log(data)
          res.status(200).send(data);
          }
              
      });

  });
};

// Return item temp table
exports.deleteReturnTemp = async (req, res) => {
  const itemReturnId = req.params.returnItemId;
  console.log(itemReturnId)
  pool.getConnection((err, connection) => {
      if (err) {
          res.status(100).send({
              message: "Error in connection database"
            });
      }

      removeReturnItemTemp(itemReturnId, 'decline');
      res.status(100).send({
        message: "successfully declined returned item"
      });

  });
};

exports.addReturnItemQuery = async (req, res) => {
  const {
    returnItemId, custOrderId, batchId, date, qty, status,
  } = req.body;
  
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

                  removeReturnItemTemp(returnItemId,'approve'); //remove item from temporary table
                  return resolve(returnItemResult);
                },
              );
            } else {
              // eslint-disable-next-line no-param-reassign
              returnItemResult.code = 200;

              removeReturnItemTemp(returnItemId,'approve'); //remove item from temporary table
              
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
  res.status(200).send(result);
};

const removeReturnItemTemp = (item_return_id, status)=>{
  pool.getConnection((err, connection) => {
    if (err) {
      reject(err);
    }
    let approved;
    if(status == 'approve'){
      approved = 1;
    }else{
      approved = 0;
    }
    connection.query(
      `UPDATE item_return_temp SET approved=${approved} WHERE item_return_id =${item_return_id}`,
      (batchErr, batchResult) => {
        connection.release();
        if (batchErr) {
          return false;
        } else {
          return true;
        }
      },
    );
  });
}

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