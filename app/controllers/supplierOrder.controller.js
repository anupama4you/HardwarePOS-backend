const pool = require("../models/db");
const supplierOrder = require("../models/supplierOrder.model");

exports.getOrdersBySupplireId = async (req, res) => {
	const result = await supplierOrder.getOrdersBySupplierId(
		req.params.supplireId
	);
	res.send(result);
};

exports.getSupplyOrdersByDates = async (req, res) => {
	const result = await supplierOrder.getSupplyOrdersByDates({
		supplierId: req.query.supplierId,
		fromDate: req.query.fromDate,
		toDate: req.query.toDate,
	});
	res.send(result);
};

exports.getOrderDetailsBySupplireOrderId = async (req, res) => {
	const result = await supplierOrder.getOrderDetailsBySupplireOrderId(
		req.params.supOrderId
	);
	res.send(result);
};

exports.deleteSupplyOrder = async (req, res) => {
	if (!req.params.supplyOrderId) {
		res.json({
			code: 100,
			message: "please provide valid parameters",
		});
		return;
	}
	const result = await supplierOrder.deleteSupplyOrder(
		req.params.supplyOrderId
	);
	res.send(result);
};
