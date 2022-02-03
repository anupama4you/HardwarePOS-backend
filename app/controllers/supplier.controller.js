const pool = require('../../db_config/db')
const Supplier = require('../models/supplier.model')

exports.addSupplier = async (req, res) => {
    const result = await Supplier.addSupplier(req.body, res);
    res.send(result);
};
  
exports.updateSupplier = async (supplier, res) => {
    const result = await Supplier.updateSupplier(supplier.body);
    res.send(result);
};

exports.getSupplier = async (req, res) => {
    const result = await Supplier.getSupplier(req.params.supplierId);
    res.send(result);
};

exports.getSupplierByName = async (req, res) => {
    const result = await Supplier.getSupplierByName(req.params.supplierName);
    res.send(result);
};

exports.getAllSuppliers = async (req, res) => {
    const result = await Supplier.getAllSuppliers();
    res.send(result);
};

// exports.deleteCustomer = async (req, res) => {
//     const result = await Customer.deleteCustomerQuery(req.params.customerId);
//     res.send(result);
// };

exports.addSupplyOrder = async (req, res) => {
  console.log(req.body)
    if (!req.body) {
        res.send({
          code: 100,
          message: 'please provide valid parameters'
        });
        return;
      } else if (!req.body.supplierId || !req.body.date || !req.body.items) {
        res.send({
          code: 100,
          message: 'please provide valid parameters'
        });
        return;
      }
    const result = await Supplier.addSupplyOrder(req.body, res);
    res.send({
      code: 200,
      message : result});
};