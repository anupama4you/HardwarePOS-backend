const Item = require('../models/item.model');
const Payment = require('../models/payment.model');
const sql = require('../../db_config/db');

/*********Get all items */
exports.getAllItems = async(req, res) => {

  sql.query(`select item.item_id, item.code, item.name, item.qty, item.length, item.description, item.isDeleted,
  subcategory.name as subcategory_name, category.name as category_name,
  (select sum(FLOOR(b.qty)) from batch b where b.item_item_id = item.item_id) as qtyOnHand,
  (select TRUNCATE(sum(substring(b.qty, -2 ))/100*item.length,0) from batch b where b.item_item_id = item.item_id) as subQtyOnHand
  from category,
  item inner join subcategory where item.subCategory_id = subcategory.subCat_id and
  subcategory.category_id = category.cat_id;`,  (error, results, fields) => {
    if (error) throw error;
    res.send(results);
  });

};

/*********Add item */
exports.addItem = async (item, res) => {
  // try{
    const {
      qty,
      length,
      subCategory_id,
      itemcode,
      itemname,
      itemdesc,
    } = item.body;

    console.log(item.body)

    sql.query(`insert into item (code, name, qty, length, description, subCategory_id) values
    ('${itemcode}', '${itemname}',${qty}, ${length}, '${itemdesc}',${subCategory_id});`, (error) => {
      if (error) throw error;
      res.status(200).send({
        message: "Successfully added item"
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

    let duplicate;

    sql.query(
      `SELECT * FROM item_return_temp WHERE cus_order_id ='${custOrderId}' && batch_id='${batchId}' `,
      (batchErr, batchResult) => {
        if (batchErr) {
          res.status(500).send({
            message: batchErr 
          });
        } else {
          console.log(batchResult.length)
          if(batchResult.length == 0){
            duplicate = false;
          }else{
            duplicate = true;
          }

          sql.query(`insert into item_return_temp (cus_order_id, batch_id, name, date, quantity, length, cus_order_qty, order_status, cus_or_sup) values
            ('${custOrderId}', '${batchId}', '${name}', '${date}',${qty}, ${len}, ${cusOrderQty}, ${status}, '${cusOrSup}');`, (err,data) => {
                if (err){
                  console.log(err)
                  res.status(500).send({
                    message: err
                  });
                }
                else {
                  // retrieve the recently inserted record
                  sql.query(`select * from item_return_temp ORDER BY item_return_id DESC LIMIT 1`, (err,data) => {
                          if (err){
                            res.status(500).send({
                              message: err
                            });
                          }
                          else {
                            res.status(200).send({data, isDuplicate: duplicate});
                          }
                              
                      });
                }
                    
            });

        }
      });
};

// Return item temp table
exports.getAllReturnItems = async (req, res) => {
  const sql_query = `SELECT * FROM item_return_temp;`
      
      sql.query(sql_query, async(err,data) => {
          if (err){
            console.log(err)
            res.status(500).send({
              message: err
            });
          }
          else {
          // console.log(data)
          res.status(200).send(data);
          }   
      });
};

// Return item temp table by customer or supplier
exports.getReturnItems = async (req, res) => {
  console.log(req.params)

  let sql_query = ''

  const cusOrSup = req.params.cusOrSup;
  if(cusOrSup == 'supplier' || cusOrSup == 'customer'){
    sql_query = `SELECT * FROM item_return_temp WHERE cus_or_sup='${cusOrSup}';`
  }else{
    sql_query = `SELECT * FROM item_return_temp;`
  }
  
  sql.query(sql_query, async(err,data) => {
      if (err){
        console.log(err)
      res.status(500).send({message : err});
      }
      else {
      // console.log(data)
      res.status(200).send(data);
      }
          
  });
};

// Return item temp table
exports.deleteReturnTemp = async (req, res) => {
  const itemReturnId = req.params.returnItemId;
  console.log(itemReturnId)
  removeReturnItemTemp(itemReturnId, 'decline');
  res.status(200).send({
    message: "successfully declined returned item"
  });
};

exports.addReturnItemQuery = async (req, res) => {
  const {
    returnItemId, custOrderId, batchId, date, qty, status,
  } = req.body;
  
  const batch = await getBatchByIdQuery(batchId);
 
  sql.query(
    `insert into item_return values(null, ${custOrderId},
      ${batchId}, '${date}', ${qty},${batch[0].selling_price * qty},
      ${batch[0].selling_price * qty})`,
    (returnItemErr, returnItemResult) => {
      if (returnItemErr) {
        res.status(500).send({
          message: returnItemErr
        });
        // eslint-disable-next-line eqeqeq
      } else if (status == 1) {
        sql.query(
          `update batch set qty = (qty+${qty}) where batch_id = ${batchId}`,
          (batchUpdateErr) => {
            if (batchUpdateErr) {
              res.status(500).send({
                message: batchUpdateErr
              });
            }
            // eslint-disable-next-line no-param-reassign
            console.log(returnItemResult);

            removeReturnItemTemp(returnItemId,'approve'); //remove item from temporary table
            res.status(200).send(returnItemResult);
          },
        );
      } else {
        // eslint-disable-next-line no-param-reassign
        returnItemResult.code = 200;

        removeReturnItemTemp(returnItemId,'approve'); //remove item from temporary table
        
        console.log(returnItemResult);
        res.status(200).send(returnItemResult);
      }
      // commit db
      sql.commit(async (errCommit) => {
        if (errCommit) {
          res.status(500).send({
            message: errCommit
          });
        }
      });
    },
  );
};

const removeReturnItemTemp = (item_return_id, status)=>{
  let approved;
  if(status == 'approve'){
    approved = 1;
  }else{
    approved = 0;
  }
  sql.query(
    `UPDATE item_return_temp SET approved=${approved} WHERE item_return_id =${item_return_id}`,
    (batchErr, batchResult) => {
      if (batchErr) {
        console.log(batchErr)
        return false;
      } else {
        return true;
      }
    },
  );
}

const getBatchByIdQuery = async (batchId) => {
  const result = await new Promise((resolve, reject) => {
    sql.query(
      `SELECT * FROM batch WHERE batch_id =${batchId}`,
      (batchErr, batchResult) => {
        if (batchErr) {
          throw batchErr;
        } else {
          resolve(batchResult);
        }
      },
    );
  });
  return result;
};