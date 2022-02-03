const pool = require('../../db_config/db');
const Item = require('../models/item.model');
const Payment = require('../models/payment.model')

exports.addPayment = async (req, res) => {
    const result = await Payment.addPayment(req.body);
    res.send(result);
};

