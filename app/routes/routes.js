module.exports = app => {
    const users = require("../controllers/user.controller");

    //******users */
    app.post("/users", users.create);
    app.get("/users", users.findAll);
    app.get("/users/:firebaseId", users.findOne);
    app.put("/users/:firebaseId", users.updateByFirebaseId);
    app.delete("/users/:firebaseId", users.deleteByFirebaseId);
    // app.delete("/users", customers.deleteAll);

    const itemController = require("../controllers/item.controller");

    //******Items */
    app.get("/get_items",itemController.getAllItems);
    app.post('/add_item', itemController.addItem);
    app.put('/item', itemController.editItem);
    app.get('/item/:item_id', itemController.getItemById);

    const customerController = require("../controllers/customer.controller");

    //******Customers */
    app.get('/customer',customerController.getAllCustomer);
    app.get('/customer/:customerId',customerController.getCustomer);
    app.delete('/customer/:customerId', customerController.deleteCustomer)
    app.post('/customer', customerController.addCustomer)
    app.put('/customer/:customerId', customerController.editCustomer)

  };