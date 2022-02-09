const Supplier = require("../models/supplier.model");

module.exports = (app) => {
	const users = require("../controllers/user.controller");

	//******users */
	app.post("/users", users.create); // OK 
	app.get("/users", users.findAll); // OK
	app.get("/users/:firebaseId", users.findOne); // OK
	app.put("/users/:firebaseId", users.updateByFirebaseId); // OK
	app.delete("/users/:firebaseId", users.deleteByFirebaseId); // OK
	// app.delete("/users", customers.deleteAll);

	//******Auth */
	app.get("/auth", users.getAuth); // TODO: how to get valid Firebase idToke

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
	app.post("/addCustomerOrder", customerController.addCustomerOrder); // TODO: Works, but logs errors still

	//******Get return debit by customer */
	app.get( // OK
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

	//******Add supply order */
	app.post("/add_supplyOrder", supplierController.addSupplyOrder); // OK

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
	app.get( // OK
		"/getOrderDetailsBySupplierOrderId/:supOrderId",
		supplierOrderController.getOrderDetailsBySupplierOrderId
	);
	app.delete( // OK
		"/deleteSupplyOrder/:supplyOrderId",
		supplierOrderController.deleteSupplyOrder
	);

	const customerOrderController = require("../controllers/customerOrder.controller");

	//******Customer order */
	app.get( // TODO: need valid FirebaseId
		"/getOrdersByCustomerId/:customerId/:idToken/:user_id",
		customerOrderController.getOrdersByCustomerId
	);
	app.get( // OK
		"/getOrderDetailsByOrderId/:customerOrderId",
		customerOrderController.getOrderDetailsByOrderId
	);
	app.put("/updateOrderId", customerOrderController.updateCustomerOrderById); // TODO:  where to use updateOrderId? Works but in Postman "Sending request" will not stop
	app.get( // OK
		"/getCustomerOrderByDates",
		customerOrderController.getCustomerOrderByDates
	);
	app.put( // OK
		"/updatePrintedStatus",
		customerOrderController.updateCustomerOrderPrintedStatus
	);

	const paymentController = require("../controllers/payment.controller");

	//******Payments */
	app.post("/payment", paymentController.addPayment); // OK

	//******Return items */
	app.post("/return", itemController.addReturnItemQuery); // OK
	app.post("/returnTemp", itemController.addReturnItemTemp); // OK
	app.delete( // OK
		"/deleteReturnTemp/:returnItemId",
		itemController.deleteReturnTemp
	);
	app.get("/getReturnTemp", itemController.getAllReturnItems); // OK
	app.get("/getReturnTempByPerson/:cusOrSup", itemController.getReturnItems); // OK

	const reportController = require("../controllers/report.controller");

	//******Reports */
	app.get("/getReportByDateRange", reportController.getReportStatictics); // TODO: Need valid FirebaseId Token
	app.get( // TODO: Need valid FirebaseId Token
		"/getReportDetailsByDateRangeAndType",
		reportController.getReportDetail
	);

	const quotationController = require("../controllers/quotation.controller");

	//****Quotations*****/
	app.post("/add_quotation", quotationController.addItem); // OK
	app.get("/get_quotation", quotationController.getAllQuotations); // OK
	app.get( // OK
		"/get_quotationFromDates",
		quotationController.getAllQuotationsfromDates
	);
	app.get( // OK
		"/getQuotationByNo/:quotationNo",
		quotationController.getQuotationByNo
	);
};
