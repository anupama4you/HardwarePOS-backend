const pool = require('../models/db')
const customerOrder = require('../models/customerOrder.model')

exports.getOrdersByCustomerId = async (req, res) => {
    const result = await customerOrder.getOrdersByCustomerId(req.params.customerId, req.params.idToken);
    res.send(result);
};

exports.getOrderDetailsByOrderId = async (req, res) => {
    const result = await customerOrder.getOrderDetailsBySupplireOrderId(req.params.customerOrderId);
    res.send(result);
};

exports.updateCustomerOrderById = async (req, res) => {
    const result = await customerOrder.updateCustomerOrderById();
    res.send(result);
};
  
