const userFirebase = require('../controllers/user.firebase');
const sql = require('../../db_config/db');
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
      let sql_query = `select
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
          sql_query += ' and co.order_status != 0 ';
        }
        sql.query(
          sql_query,
          (customerOrderSummeryErr, customerOrderSummeryResult) => {
            if (customerOrderSummeryErr) {
              reject(customerOrderSummeryErr);
            } else {
              resolve(customerOrderSummeryResult);
            }
          },
        );
    });
    return result;
  };

  Report.getCreditOrderSummeryQuery = (fromDate, toDate, userRole) => {
    const result = new Promise((resolve, reject) => {
      let sql_query = `select
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
          sql_query += ' and co.order_status != 0 ';
        }
        sql.query(
          sql_query,
          (customerOrderSummeryErr, customerOrderSummeryResult) => {
            if (customerOrderSummeryErr) {
              reject(customerOrderSummeryErr);
            } else {
              resolve(customerOrderSummeryResult);
            }
          },
        );
    });
    return result;
  };

  Report.getSupplyOrderSummeryQuery = (fromDate, toDate) => {
    const result = new Promise((resolve, reject) => {
      const sql_query = `select
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
        sql.query(
          sql_query,
          (supplierOrderSummeryErr, supplierOrderSummeryResult) => {
            if (supplierOrderSummeryErr) {
              reject(supplierOrderSummeryErr);
            } else {
              resolve(supplierOrderSummeryResult);
            }
          },
        );
    });
    return result;
  };

  Report.getReturnItemSummeryQuery = (fromDate, toDate) => {
    const result = new Promise((resolve, reject) => {
      const sql_query = `SELECT
          sum(ir.return_value) as returnTotal,
          sum(ir.debit_balance) as returnDebitBalance,
          count(ir.iditem_return) as returnItemCount
        FROM item_return ir
        where ir.item_return_date >= '${fromDate}' and ir.item_return_date <= '${toDate} 23:59:59'
        `;
        sql.query(
          sql_query,
          (itemReturnSummeryErr, itemReturnSummeryResult) => {
            
            console.log(sql);
            if (itemReturnSummeryErr) {
              reject(itemReturnSummeryErr);
            } else {
              resolve(itemReturnSummeryResult);
            }
          },
        );
    });
    return result;
  };

  Report.getReportDetailQuery = (fromDate, toDate, type, userRole) => {
    const result = new Promise((resolve, reject) => {
      let sql_query = '';
        if (type == 1) {
          sql_query += `select
          co.customer_order_date as order_date, co.invoice_no, c.customer_name AS customer, u.name AS user, co.customer_order_total as total, co.customer_order_paid as paid
          from customer_order co, customer c, users u
          where co.customer_order_date >= '${fromDate}' and co.customer_order_date <= '${toDate} 23:59:59'
          and co.customer_order_total <= co.customer_order_paid
          and co.customer_idcustomer =c.idcustomer
          and co.user_id = u.user_firebase_uid`;
          if (userRole === 2) {
            sql_query += ' and co.order_status != 0 ';
          }
        }
        if (type == 2) {
          sql_query += `select
          co.customer_order_date as order_date, co.invoice_no, c.customer_name as customer, u.name as user, co.customer_order_total as total, co.customer_order_paid as paid
          from customer_order co, customer c, users u
          where co.customer_order_date >= '${fromDate}' and co.customer_order_date <= '${toDate} 23:59:59'
          and co.customer_order_total > co.customer_order_paid
          and co.customer_idcustomer =c.idcustomer
          and co.user_id = u.user_firebase_uid`;
          if (userRole === 2) {
            sql_query += ' and co.order_status != 0 ';
          }
        }
        if (type == 3) {
          sql_query += `SELECT
          so.date as order_date, s.name, so.order_id
          from supplyorder so, supplier s
          where so.date >= '${fromDate}' and so.date <= '${toDate} 23:59:59'
          and so.supplier_id = s.supplier_id `;
        }
        if (type == 4) {
          sql_query += `SELECT
          ir.item_return_date as returned_date, c.customer_name as customer, u.name as user, ir.return_value as returned_amount
          FROM item_return ir, customer_order co, customer c, users u
          where ir.item_return_date >= '${fromDate}' and ir.item_return_date <= '${toDate} 23:59:59'
          and ir.customer_order_has_batch_customer_order_idcustomer_order = co.idcustomer_order
          and co.customer_idcustomer = c.idcustomer
          and co.user_id = u.user_firebase_uid`;
        }

        sql.query(
          sql_query,
          (itemReturnSummeryErr, itemReturnSummeryResult) => {
            
            // console.log(sql);
            if (itemReturnSummeryErr) {
              reject(itemReturnSummeryErr);
            } else {
              resolve(itemReturnSummeryResult);
            }
          },
        );
    });
    return result;
  };

Report.getReportDetail = async ({
fromDate, toDate, type, idToken,
}, res) => {
  console.log(type)
    const authUser = await userFirebase.verifyIdToken(idToken);
    const userId = authUser;
    const user = await userModel.findByFirebaseId(userId);
    const userRole = user[0].user_role_type;
    console.log(userRole);
    const reportDetail = await Report.getReportDetailQuery(fromDate, toDate, type, userRole);
    return (reportDetail);
};


module.exports = Report;
