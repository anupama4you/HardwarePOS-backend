const pool = require("../models/db");

const SubCategory = function (category) {};

SubCategory.getSubCategory = async (catId) => {
	const result = await new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) {
				reject(err);
			}
			connection.query(
				`select * from subcategory where category_id = '${catId}';`,
				(customerGetErr, customerGetResult) => {
					connection.release();
					if (customerGetErr) {
						reject(customerGetErr);
					} else {
						resolve(customerGetResult);
					}
				}
			);
		});
	});
	return result;
};

SubCategory.addsubCategory = async (name, cat_id) => {
	const result = await new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) {
				reject(err);
			}
			connection.query(
				`insert into subcategory (name, category_id) values ('${name}', ${cat_id});`,
				(customerAddErr, customerAddResult) => {
					connection.release();
					if (customerAddErr) {
						resolve(customerAddErr);
					} else {
						// eslint-disable-next-line
						customerAddResult.code = 200;
						resolve(customerAddResult);
					}
				}
			);
		});
	});
	return result;
};

module.exports = SubCategory;
