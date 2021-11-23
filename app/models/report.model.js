const userFirebase = require('../controllers/user.firebase');
const pool = require('../models/db');
const userModel = require('../models/user.model')

const Report = function(report) {};

Report.getReportStatictics = async ({ fromDate, toDate, idToken }, res) => {
    const authUser = await userFirebase.verifyIdToken(idToken);
    const userId = authUser;
    const user = await userModel.findByFirebaseId(userId);
    const userRole = user[0].user_role_type;
    const cashOrder = await Report.getCashOrderSummeryQuery(fromDate, toDate, userRole);
    const creditOrder = await Report.getCreditOrderSummeryQuery(fromDate, toDate, userRole);
    const supplyOrder = await Report.getSupplyOrderSummeryQuery(fromDate, toDate);
    const returnItem = await Report.getReturnItemSummeryQuery(fromDate, toDate, userRole);
    return ({
      cashOrder,
      creditOrder,
      supplyOrder,
      returnItem,
    });
  };

  Report.getCashOrderSummeryQuery = (fromDate, toDate, userRole) => {
    const result = new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        }
        let sql = `select
          sum(co.customer_order_total ) as customerOrderTotal,
          count(co.customer_idcustomer) as customerOrderCount,
          sum(co.customer_order_total -
            (
            select sum(b.buying_price * cob.customer_order_has_batch_qty)
            from customer_order_has_batch cob, batch b
            where cob.batch_batch_id = b.batch_id
            and cob.customer_order_idcustomer_order = co.idcustomer_order
            )
          ) as customerOrderProfit
        from customer_order co
        where co.customer_order_date >= '${fromDate}' and co.customer_order_date <= '${toDate} 23:59:59'
        and co.customer_order_total <= co.customer_order_paid
        `;
        if (userRole === 2) {
          sql += ' and co.order_status != 0 ';
        }
        connection.query(
          sql,
          (customerOrderSummeryErr, customerOrderSummeryResult) => {
            connection.release();
            console.log(sql);
            if (customerOrderSummeryErr) {
              reject(customerOrderSummeryErr);
            } else {
              resolve(customerOrderSummeryResult);
            }
          },
        );
      });
    });
    return result;
  };

  Report.getCreditOrderSummeryQuery = (fromDate, toDate, userRole) => {
    const result = new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        }
        let sql = `select
        sum(co.customer_order_total ) as customerOrderTotal,
        count(co.customer_idcustomer) as customerOrderCount,
        sum(co.customer_order_total -
            (
            select sum(b.buying_price * cob.customer_order_has_batch_qty)
            from customer_order_has_batch cob, batch b
            where cob.batch_batch_id = b.batch_id
            and cob.customer_order_idcustomer_order = co.idcustomer_order
            )
          ) as customerOrderProfit,
          sum(
            co.customer_order_total - co.customer_order_paid
          ) as customerOrderDue
        from customer_order co
        where co.customer_order_date >= '${fromDate}' and co.customer_order_date <= '${toDate} 23:59:59'
        and co.customer_order_total > co.customer_order_paid
        `;
        if (userRole === 2) {
          sql += ' and co.order_status != 0 ';
        }
        connection.query(
          sql,
          (customerOrderSummeryErr, customerOrderSummeryResult) => {
            connection.release();
            console.log(sql);
            if (customerOrderSummeryErr) {
              reject(customerOrderSummeryErr);
            } else {
              resolve(customerOrderSummeryResult);
            }
          },
        );
      });
    });
    return result;
  };

  Report.getSupplyOrderSummeryQuery = (fromDate, toDate) => {
    const result = new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        }
        const sql = `select
            count(so.order_Id) as supplyOrderCount,
            sum((
              select sum(b.buying_price * shb.supplyorder_has_batch__qty)
              from supplyorder_has_batch shb, batch b
              where shb.batch_batch_id = b.batch_id
              and shb.supplyorder_order_Id = so.order_Id
            )) supplyOrderTotal
          from supplyorder so
          where so.date >= '${fromDate}' and so.date <='${toDate} 23:59:59'
        `;
        connection.query(
          sql,
          (supplireOrderSummeryErr, supplireOrderSummeryResult) => {
            connection.release();
            console.log(sql);
            if (supplireOrderSummeryErr) {
              reject(supplireOrderSummeryErr);
            } else {
              resolve(supplireOrderSummeryResult);
            }
          },
        );
      });
    });
    return result;
  };

  Report.getReturnItemSummeryQuery = (fromDate, toDate) => {
    const result = new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        }
        const sql = `SELECT
          sum(ir.return_value) as returnTotal,
          sum(ir.debit_balance) as returnDebitBalance,
          count(ir.iditem_return) as returnItemCount
        FROM item_return ir
        where ir.item_return_date >= '${fromDate}' and ir.item_return_date <= '${toDate} 23:59:59'
        `;
        connection.query(
          sql,
          (itemReturnSummeryErr, itemReturnSummeryResult) => {
            connection.release();
            console.log(sql);
            if (itemReturnSummeryErr) {
              reject(itemReturnSummeryErr);
            } else {
              resolve(itemReturnSummeryResult);
            }
          },
        );
      });
    });
    return result;
  };

  Report.getReportDetailQuery = (fromDate, toDate, type, userRole) => {
    const result = new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
        }
        let sql = '';
        if (type == 1) {
          sql += `select
            *
          from customer_order co, customer c
          where co.customer_order_date >= '${fromDate}' and co.customer_order_date <= '${toDate} 23:59:59'
          and co.customer_order_total <= co.customer_order_paid
          and co.customer_idcustomer =c.idcustomer `;
          if (userRole === 2) {
            sql += ' and co.order_status != 0 ';
          }
        }
        if (type == 2) {
          sql += `select
            *
          from customer_order co, customer c
          where co.customer_order_date >= '${fromDate}' and co.customer_order_date <= '${toDate} 23:59:59'
          and co.customer_order_total > co.customer_order_paid
          and co.customer_idcustomer =c.idcustomer `;
          if (userRole === 2) {
            sql += ' and co.order_status != 0 ';
          }
        }
        if (type == 3) {
          sql += `select *
          from supplyorder so, supplier s
          where so.date >= '${fromDate}' and so.date <= '${toDate} 23:59:59'
          and so.supplier_id = s.supplier_id `;
        }
        if (type == 4) {
          sql += `SELECT *
          FROM item_return ir, customer_order co, customer c
          where ir.item_return_date >= '${fromDate}' and ir.item_return_date <= '${toDate} 23:59:59'
          and ir.customer_order_has_batch_customer_order_idcustomer_order = co.idcustomer_order
          and co.customer_idcustomer = c.idcustomer`;
        }
        connection.query(
          sql,
          (itemReturnSummeryErr, itemReturnSummeryResult) => {
            connection.release();
            // console.log(sql);
            if (itemReturnSummeryErr) {
              reject(itemReturnSummeryErr);
            } else {
              resolve(itemReturnSummeryResult);
            }
          },
        );
      });
    });
    return result;
  };

Report.getReportDetail = async ({
fromDate, toDate, type, idToken,
}, res) => {
    const authUser = await userFirebase.verifyIdToken(idToken);
    const userId = authUser;
    const user = await userModel.findByFirebaseId(userId);
    const userRole = user[0].user_role_type;
    console.log(userRole);
    const reportDetail = await Report.getReportDetailQuery(fromDate, toDate, type, userRole);
    return (reportDetail);
};
  

module.exports = Report;

