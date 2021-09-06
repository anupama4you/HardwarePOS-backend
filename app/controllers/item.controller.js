const pool = require('../models/db')
const Item = require('../models/item.model')

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

    pool.getConnection((err, connection) => {
        if (err) {
            res.status(100).send({
                message: "Error in connection database"
              });
        }
  
      connection.query(`insert into item (code, name, qty, length, description, subCategory_id) values
      ('${itemcode}', '${itemname}',${qty}, ${length}, '${itemdesc}',${subCategory_id});`, (err) => {
        connection.release();
        if (err)
          res.status(500).send({
            message:
              err.message || "Some error occurred while retrieving items."
          });
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

  