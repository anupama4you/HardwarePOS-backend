const pool = require('../../db_config/db');

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
    customer_note
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
          isDeleted = ?,
          customer_note = ?
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
            customer_note,
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
          `select item_id,code,name,qty,length AS len,description, subCategory_id, rol, isDeleted, customer_note from item
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

  Item.getStockWithBatchesQuery = async () => {
    const result = await new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        }
        connection.query(
          `select i.*,b.*,FLOOR(b.qty) as qtyOnHand,
          TRUNCATE(((b.qty % 1) * 100 * i.length)/100,0) as subQtyOnHand,
          s.name as subcategory_name, c.name as category_name
          from batch b, item i, category c, subcategory s
          where b.item_item_id = i.item_id and b.qty != 0
          and i.subCategory_id = s.subCat_id
          and s.category_id = c.cat_id
          ;`,
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

  Item.getLatestPriceByItemIdQuery = async (itemId) => {
    const result = await new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        }
        connection.query(
          `SELECT * FROM batch b where b.item_item_id = ? order by b.batch_id desc limit 1
          `, [itemId],
          (batchErr, batchResult) => {
            connection.release();
            if (batchErr) {
              reject(batchErr);
            } else {
              console.log(batchResult)
              resolve(batchResult);
            }
          },
        );
      });
    });
    return result;
  };

  Item.getItemTransactionHistoryQuery = async (item_id) => {
    const result = await new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        }
        connection.query(
          `SELECT
          sup.name as name,
          s.order_Id as id, batch_batch_id, 'supplier' as type , s.date as date
          , i.name as item, sob.supplyorder_has_batch__qty as quantity
          FROM supplyorder_has_batch sob, batch b, item i, supplyorder s, supplier sup
          where sob.batch_batch_id = b.batch_id
          and b.item_item_id = i.item_id
          and sob.supplyorder_order_Id = s.order_Id
          and sup.supplier_id = s.supplier_id
          and i.item_id = ${item_id}
          UNION
          SELECT
          cus.customer_name,
          co.invoice_no as id, batch_batch_id, 'customer' as type, co.customer_order_date as date
          , i.name as item, (-1*cob.customer_order_has_batch_qty) as quantity
          FROM customer_order_has_batch cob, batch b, item i, customer_order co, customer cus
          where cob.batch_batch_id = b.batch_id
          and b.item_item_id = i.item_id
          and co.idcustomer_order = cob.customer_order_idcustomer_order
          and cus.idcustomer = co.idcustomer_order
          and i.item_id = ${item_id}
          UNION
          SELECT
          ir.customer_order_has_batch_customer_order_idcustomer_order,
          ir.iditem_return as id, ir.customer_order_has_batch_batch_batch_id, 'return' as type,
          ir.item_return_date as date
          , i.name as item, ir.item_return_qty as quantity
          FROM item_return ir, batch b, item i
          where ir.customer_order_has_batch_batch_batch_id = b.batch_id
          and b.item_item_id = i.item_id
          and i.item_id = ${item_id}
          order by date
          ;`,
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
    const result2 = await new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        }
        connection.query(
          `select
          (
          SELECT
          sum(sob.supplyorder_has_batch__qty)
          FROM supplyorder_has_batch sob, batch b, item i, supplyorder s
          where sob.batch_batch_id = b.batch_id
          and b.item_item_id = i.item_id
          and sob.supplyorder_order_Id = s.order_Id
          and i.item_id = ${item_id}
          ) as totalIn,
          (
          SELECT sum(cob.customer_order_has_batch_qty)
          FROM customer_order_has_batch cob, batch b, item i, customer_order co
          where cob.batch_batch_id = b.batch_id
          and b.item_item_id = i.item_id
          and co.idcustomer_order = cob.customer_order_idcustomer_order
          and i.item_id = ${item_id}
          ) as totalOut,
          (
          SELECT IF(sum(ir.item_return_qty) IS NULL or sum(ir.item_return_qty) = '', 0, sum(ir.item_return_qty)) as balance
          FROM item_return ir, batch b, item i
          where ir.customer_order_has_batch_batch_batch_id = b.batch_id
          and b.item_item_id = i.item_id
          and i.item_id = ${item_id}
          ) as totalReturn,
          (
          (
          SELECT
          sum(sob.supplyorder_has_batch__qty)
          FROM supplyorder_has_batch sob, batch b, item i, supplyorder s
          where sob.batch_batch_id = b.batch_id
          and b.item_item_id = i.item_id
          and sob.supplyorder_order_Id = s.order_Id
          and i.item_id = ${item_id}
          )-(
          SELECT sum(cob.customer_order_has_batch_qty)
          FROM customer_order_has_batch cob, batch b, item i, customer_order co
          where cob.batch_batch_id = b.batch_id
          and b.item_item_id = i.item_id
          and co.idcustomer_order = cob.customer_order_idcustomer_order
          and i.item_id = ${item_id}
          )
          )+(
          SELECT IF(sum(ir.item_return_qty) IS NULL or sum(ir.item_return_qty) = '', 0, sum(ir.item_return_qty)) as balance
          FROM item_return ir, batch b, item i
          where ir.customer_order_has_batch_batch_batch_id = b.batch_id
          and b.item_item_id = i.item_id
          and i.item_id = ${item_id}
          ) as balance
          ;`,
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
    return {
      summery: result2,
      history: result
    };
  };

  Item.getROLReachedItems = async (res) => {
    const result = await new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        }
        connection.query(
          `select item.item_id, item.code, item.name, item.qty, item.length, item.description,
            subcategory.name as subcategory_name, category.name as category_name,
            (select sum(FLOOR(b.qty)) from batch b where b.item_item_id = item.item_id and b.qty != 0 ) as qtyOnHand,
            (select TRUNCATE(sum(substring(b.qty, -2 ))/100*item.length,0) from batch b where b.item_item_id = item.item_id and b.qty != 0 ) as subQtyOnHand
            from category,
            item inner join subcategory where item.subCategory_id = subcategory.subCat_id and
            subcategory.category_id = category.cat_id
            and item.rol >= (select sum(b.qty) from batch b where b.item_item_id = item.item_id and b.qty != 0 )
            ;
          `,
          (getROLReachedItemsErr, getROLReachedItemsResult) => {
            connection.release();
            if (getROLReachedItemsErr) {
              resolve(getROLReachedItemsErr);
            } else {
              // eslint-disable-next-line
              getROLReachedItemsResult.code = 200;
              resolve(getROLReachedItemsResult);
            }
          },
        );
      });
    });
    return result;
  };

  module.exports = Item;