const pool = require('../models/db')

exports.addItem = async (req, res) => {
    console.log(req.body);

    const {
      customerId,
      date,
      total,
      orderDiscount,
      orderStatus,
      customerOrderCreditRate,
      batches
    } = req.body;

    let bacthesObj = JSON.stringify(batches) //Json array into object

    pool.getConnection((err, connection) => {
        if (err) {
            res.status(100).send({
                message: "Error in connection database"
              });
        }
  
      connection.query(`insert into quotation (customerId, date, total, orderDiscount, orderStatus, customerOrderCreditRate, batches) values
      (${customerId}, '${date}',${total}, ${orderDiscount}, ${orderStatus},${customerOrderCreditRate}, '${bacthesObj}');`, (err,data) => {
        connection.release();
        if (err){
          res.status(500).send({
            message:
              err
          });
        }
        else 
            res.status(200).send(data);
    });
    });
  };

  exports.getAllQuotations = async(req, res) => {
    pool.getConnection((err, connection) => {
      if (err) {
          res.status(100).send({
              message: "Error in connection database"
            });
      }
      connection.query(`select * from quotation;`, (err, rows) => {
        connection.release();
        if (err)
            res.status(500).send({
              message:
                err.message || "Some error occurred while retrieving items."
            });
          else res.send(rows);
      });
    });
  };