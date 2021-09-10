const pool = require('../models/db')
const Payment = require('../models/payment.model')

exports.addPayment = async (req, res) => {
    const result = await Payment.addPayment(req.body);
    res.send(result);
};

exports.addReturnItem = async (req, res) => {
    const result = await new Payment().addPaymentQuery(req.body);
    res.send(result);
};