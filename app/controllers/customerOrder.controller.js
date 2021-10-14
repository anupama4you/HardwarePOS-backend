const pool = require('../models/db')
const customerOrder = require('../models/customerOrder.model')

exports.getOrdersByCustomerId = async (req, res) => {
    const result = await customerOrder.getOrdersByCustomerId(req.params.customerId, req.params.idToken);
    res.send(result);
};

exports.getOrderDetailsByOrderId = async (req, res) => {
    const result = await customerOrder.getOrderDetailsByCustomerOrderId(req.params.customerOrderId);
    res.send(result);
};

exports.updateCustomerOrderById = async (req, res) => {
    const result = await customerOrder.updateCustomerOrderById();
    res.send(result);
};

exports.getCustomerOrderByDates = async (req, res) => {
    console.log(req.query)
    const result = await customerOrder.getCustomerOrdersByDates({
      customerId: req.query.customerId,
      fromDate: req.query.fromDate,
      toDate: req.query.toDate
    });
    res.send(result);
  };
  
