const sql = require('../../db_config/db')
const Report = require('../models/report.model')

exports.getReportStatictics = async (req, res) => {
    const result = await Report.getReportStatictics({
        fromDate: req.query.fromDate,
        toDate: req.query.toDate,
        idToken: req.query.idToken,
      });
    res.send(result);
};

exports.getReportDetail = async (req, res) => {
	console.log(req.query.fromDate);
	const result = await Report.getReportDetail({
		fromDate: req.query.fromDate,
		toDate: req.query.toDate,
		type: req.query.type,
		idToken: req.query.idToken,
		});
	res.send(result);
};

