const Supplier = require("../models/supplier.model");

module.exports = (app) => {
	const users = require("../controllers/user.controller");

	//******users */
	// app.post("/users", users.create);
	// app.get("/users", users.findAll);
	// app.get("/users/:firebaseId", users.findOne);
	// app.put("/users/:firebaseId", users.updateByFirebaseId);
	app.delete("/users/:firebaseId", users.deleteByFirebaseId); //TODO: need authorized user for this, but works
	//// app.delete("/users", customers.deleteAll);

	// //******Auth */
	// app.get("/auth", users.getAuth);

	const itemController = require("../controllers/item.controller");

	//******Items */
	app.get("/get_items", itemController.getAllItems); // OK
	app.post("/add_item", itemController.addItem); // OK
	app.put("/item", itemController.editItem); // OK
	app.get("/item/:item_id", itemController.getItemById); // OK

	app.get("/getStock", itemController.getStockWithBatches); // OK
	app.get( // OK
		"/getLatestPriceByItemId/:itemId", 
		itemController.getLatestPriceByItemId
	);
	app.get( //OK
		"/getItemTransactionHistory/:itemId",
		itemController.getItemTransactionHistory
	);
	app.get("/getROLReachedItems", itemController.getROLReachedItems); // OK

	const customerController = require("../controllers/customer.controller");

	//******Customers */
	app.get("/customer", customerController.getAllCustomer); // OK
	app.get("/customer/:customerId", customerController.getCustomer); // OK
	app.delete("/customer/:customerId", customerController.deleteCustomer); // OK
	app.post("/customer", customerController.addCustomer); // OK
	app.put("/customer/:customerId", customerController.editCustomer); // OK

	//******Add customer order */
	app.post("/addCustomerOrder", customerController.addCustomerOrder); // TODO: How to use 'batches'?

	//******Get return debit by customer */
	app.get( // TODO: sql syntax error?
		"/getReturnDebitByCustomer/:customerId",
		customerController.getReturnDebitByCustomer
	);

	const categoryController = require("../controllers/category.controller");

	//******Category */
	app.get("/get_category", categoryController.getAllCategories); // OK
	app.post("/add_category", categoryController.addCategory); // OK

	const subCategoryController = require("../controllers/sub_category.controller");

	//******Sub Category */
	app.get("/get_subcategory/:catId", subCategoryController.getSubCategory); // OK
	app.post("/add_subcategory", subCategoryController.addSubCategory); // OK

	const supplierController = require("../controllers/supplier.controller");

	//******Supplier */
	app.post("/add_supplier", supplierController.addSupplier); //OK
	app.get("/get_suppliers", supplierController.getAllSuppliers); // OK
	app.get("/get_Supplier/:supplierId", supplierController.getSupplier); // OK
	app.put("/updateSupplier", supplierController.updateSupplier); // OK

	// //******Add supply order */
	// app.post("/add_supplyOrder", supplierController.addSupplyOrder); // TODO

	const supplierOrderController = require("../controllers/supplierOrder.controller");

	//******supply order */
	app.get( // OK
		"/getOrdersBySupplierId/:supplierId",
		supplierOrderController.getOrdersBySupplierId
	);
	app.get( // OK
		"/getSupplyOrderByDates",
		supplierOrderController.getSupplyOrdersByDates
	);
	app.get(
		"/getOrderDetailsBySupplierOrderId/:supOrderId",
		supplierOrderController.getOrderDetailsBySupplierOrderId
	);
	// app.delete(
	// 	"/deleteSupplyOrder/:supplyOrderId",
	// 	supplierOrderController.deleteSupplyOrder
	// );

	// const customerOrderController = require("../controllers/customerOrder.controller");

	// //******Customer order */
	// app.get(
	// 	"/getOrdersByCustomerId/:customerId/:idToken/:user_id",
	// 	customerOrderController.getOrdersByCustomerId
	// );
	// app.get(
	// 	"/getOrderDetailsByOrderId/:customerOrderId",
	// 	customerOrderController.getOrderDetailsByOrderId
	// );
	// app.put("/updateOrderId", customerOrderController.updateCustomerOrderById);
	// app.get(
	// 	"/getCustomerOrderByDates",
	// 	customerOrderController.getCustomerOrderByDates
	// );
	// app.put(
	// 	"/updatePrintedStatus",
	// 	customerOrderController.updateCustomerOrderPrintedStatus
	// );

	// const paymentController = require("../controllers/payment.controller");

	// //******Payments */
	// app.post("/payment", paymentController.addPayment);

	// //******Return items */
	// app.post("/return", itemController.addReturnItemQuery);
	// app.post("/returnTemp", itemController.addReturnItemTemp);
	// app.delete(
	// 	"/deleteReturnTemp/:returnItemId",
	// 	itemController.deleteReturnTemp
	// );
	// app.get("/getReturnTemp", itemController.getAllReturnItems);
	// app.get("/getReturnTempByPerson/:cusOrSup", itemController.getReturnItems);

	// const reportController = require("../controllers/report.controller");

	// //******Reports */
	// app.get("/gerReportByDateRange", reportController.getReportStatictics);
	// app.get(
	// 	"/gerReportDetailsByDateRangeAndType",
	// 	reportController.getReportDetail
	// );

	// const quotationController = require("../controllers/quotation.controller");

	// //****Quotations*****/
	// app.post("/add_quotation", quotationController.addItem);
	// app.get("/get_quotation", quotationController.getAllQuotations);
	// app.get(
	// 	"/get_quotationFromDates",
	// 	quotationController.getAllQuotationsfromDates
	// );
	// app.get(
	// 	"/getQuotationByNo/:quotationNo",
	// 	quotationController.getQuotationByNo
	// );
};
