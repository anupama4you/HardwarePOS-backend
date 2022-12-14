const sql = require('../../db_config/db')
const Customer = require('../models/customer.model');
const ReturnItem = require('../models/returnItem.model');

exports.addCustomer = async (req, res) => {
    const result = await Customer.addCustomerQuery(req.body);
    res.send(result);
};
  
exports.editCustomer = async (customer, res) => {
    const result = await Customer.editCustomerQuery(customer.body);
    res.send(result);
};

exports.getCustomer = async (req, res) => {
    const result = await Customer.getCustomerQuery(req.params.customerId);
    res.send(result);
};

exports.getAllCustomer = async (req, res) => {
    const result = await Customer.getAllCustomerQuery();
    res.send(result);
};

exports.deleteCustomer = async (req, res) => {
    const result = await Customer.deleteCustomerQuery(req.params.customerId);
    res.send(result);
};

exports.addCustomerOrder = async (req, res) => {
    const result = await Customer.addCustomerOrder(req.body);
    res.send(result);
};

exports.getReturnDebitByCustomer = async (req, res) => {
    const result = await ReturnItem.getReturnDebitByCustomerQuery(req.params.customerId);
    res.send(result);
};