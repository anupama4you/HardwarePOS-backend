const pool = require("../models/db");
const customerOrder = require("../models/customerOrder.model");

exports.getOrdersByCustomerId = async (req, res) => {
	const result = await customerOrder.getOrdersByCustomerId(
		req.params.customerId,
		req.params.idToken,
		req.params.user_id
	);
	res.send(result);
};

exports.getOrderDetailsByOrderId = async (req, res) => {
	const result = await customerOrder.getOrderDetailsByCustomerOrderId(
		req.params.customerOrderId
	);
	res.send(result);
};

exports.updateCustomerOrderById = async (req, res) => {
	const result = await customerOrder.updateCustomerOrderById();
	res.send(result);
};

exports.updateCustomerOrderPrintedStatus = async (req, res) => {
	const print_status = req.body.printedStatus;
	const customerOrderId = req.body.cusOrderId;

	pool.getConnection((err, connection) => {
		if (err) {
			reject(err);
		}
		connection.query(
			`SELECT * FROM customer_order where idcustomer_order=${customerOrderId} `,
			(customerDeleteErr, customerDeleteResult) => {
				connection.release();
				if (customerDeleteErr) {
					res.status(500).send({
						message: "Error in connection database",
					});
				} else {
					if (customerDeleteResult[0].printed == 1) {
						res.status(200).send({
							printed: true,
							data: customerDeleteResult[0],
						});
					} else {
						connection.query(
							`UPDATE customer_order SET printed=${print_status} where idcustomer_order=${customerOrderId} `,
							(customerDeleteErr, customerDeleteResult) => {
								if (customerDeleteErr) {
									res.status(500).send({
										message: customerDeleteErr,
									});
								} else {
									res.status(200).send({
										printed: false,
										data: customerDeleteResult,
									});
								}
							}
						);
					}
				}
			}
		);
	});
};

exports.getCustomerOrderByDates = async (req, res) => {
	const result = await customerOrder.getCustomerOrdersByDates({
		customerId: req.query.customerId,
		fromDate: req.query.fromDate,
		toDate: req.query.toDate,
	});
	res.send(result);
};
