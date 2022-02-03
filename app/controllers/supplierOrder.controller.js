const pool = require('../../db_config/db')
const supplierOrder = require('../models/supplierOrder.model')

exports.getOrdersBySupplierId = async (req, res) => {
    const result = await supplierOrder.getOrdersBySupplierId(req.params.supplierId);
    res.send(result);
};

exports.getSupplyOrdersByDates = async (req, res) => {
  console.log(req.query)
  const result = await supplierOrder.getSupplyOrdersByDates({
    supplierId: req.query.supplierId,
    fromDate: req.query.fromDate,
    toDate: req.query.toDate
  });
  res.send(result);
};

exports.getOrderDetailsBySupplierOrderId = async (req, res) => {
  console.log(req.params.supOrderId)
    const result = await supplierOrder.getOrderDetailsBySupplierOrderId(req.params.supOrderId);
    res.send(result);
};

exports.deleteSupplyOrder = async (req, res) => {
    if (!req.params.supplyOrderId) {
        res.json({
          code: 100,
          message: 'please provide valid parameters'
        });
        return;
      }
    const result = await supplierOrder.deleteSupplyOrder(req.params.supplyOrderId);
    res.send(result);
};
  
