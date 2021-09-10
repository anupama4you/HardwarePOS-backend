const Supplier = require("../models/supplier.model");

module.exports = app => {
    const users = require("../controllers/user.controller");

    //******users */
    app.post("/users", users.create);
    app.get("/users", users.findAll);
    app.get("/users/:firebaseId", users.findOne);
    app.put("/users/:firebaseId", users.updateByFirebaseId);
    app.delete("/users/:firebaseId", users.deleteByFirebaseId);
    // app.delete("/users", customers.deleteAll);

    //******Auth */
    app.get('/auth', users.getAuth );

    const itemController = require("../controllers/item.controller");

    //******Items */
    app.get('/get_items',itemController.getAllItems);
    app.post('/add_item', itemController.addItem);
    app.put('/item', itemController.editItem);
    app.get('/item/:item_id', itemController.getItemById);

    app.get('/getStock',itemController.getStockWithBatches);
    app.get('/getLatestPriceByItemId/:itemId',itemController.getLatestPriceByItemId);
    app.get('/getItemTransactionHistory/:itemId',itemController.getItemTransactionHistory);
    app.get('/getROLReachedItems',itemController.getROLReachedItems);

    const customerController = require("../controllers/customer.controller");

    //******Customers */
    app.get('/customer',customerController.getAllCustomer);
    app.get('/customer/:customerId',customerController.getCustomer);
    app.delete('/customer/:customerId', customerController.deleteCustomer)
    app.post('/customer', customerController.addCustomer)
    app.put('/customer/:customerId', customerController.editCustomer)

    //******Add customer order */
    app.post('/addCustomerOrder', customerController.addCustomerOrder)

    //******Get return debit by customer */
    app.get('/getReturnDebitByCustomer/:customerId',customerController.getReturnDebitByCustomer);

    const categoryController = require('../controllers/category.controller');

    //******Category */
    app.get('/get_category', categoryController.getAllCategories);
    app.post('/add_category', categoryController.addCategory);

    const subCategoryController = require('../controllers/sub_category.controller');

    //******Sub Category */
    app.get('/get_subcategory/:catId', subCategoryController.getSubCategory);
    app.post('/add_subcategory', subCategoryController.addSubCategory);

    const supplierController = require('../controllers/supplier.controller');

    //******Supplier */
    app.post('/add_supplier', supplierController.addSupplier);
    app.get('/get_suppliers', supplierController.getAllSuppliers);
    app.get('/get_Supplier/:supplierId', supplierController.getSupplier);
    app.put('/updateSupplier', supplierController.updateSupplier);

    //******Add supply order */
    app.post('/add_supplyOrder', supplierController.addSupplyOrder);

    const supplierOrderController = require('../controllers/supplierOrder.controller');

    //******supply order */
    app.get('/getOrdersBySupplireId/:supplireId', supplierOrderController.getOrdersBySupplireId);
    app.get('/getOrderDetailsBySupplireOrderId/:supOrderId', supplierOrderController.getOrderDetailsBySupplireOrderId);
    app.delete('/deleteSupplyOrder/:supplyOrderId', supplierOrderController.deleteSupplyOrder)

    const customerOrderController = require('../controllers/customerOrder.controller');

    //******Customer order */
    app.get('/getOrdersByCustomerId/:customerId/:idToken', customerOrderController.getOrdersByCustomerId);
    app.get('/getOrderDetailsByOrderId/:customerOrderId', customerOrderController.getOrderDetailsByOrderId);
    app.put('/updateOrderId', customerOrderController.updateCustomerOrderById);

    const paymentController = require('../controllers/payment.controller');

    //******Payments */
    app.post('/payment', paymentController.addPayment);
    app.post('/return', paymentController.addReturnItem);

    const reportController = require('../controllers/report.controller')

    //******Reports */
    app.get('/gerReportByDateRange', reportController.getReportStatictics)
    app.get('/gerReportDetailsByDateRangeAndType', reportController.getReportDetail)
  };