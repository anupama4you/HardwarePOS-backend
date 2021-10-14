const pool = require('../models/db')

exports.addItem = async (req, res) => {
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

    let quotationNo = '';

    pool.getConnection((err, connection) => {
        if (err) {
            res.status(100).send({
                message: "Error in connection database"
              });
        }
        connection.query(`select * from quotation ORDER BY quotation_id DESC LIMIT 1;`, (err, row) => {
          if (err)
              console.log(err)
            else {
              quotationNo = 'QU_' + row[0].quotation_id
              console.log(quotationNo);

              connection.query(`insert into quotation (quotation_no, customerId, date, total, orderDiscount, orderStatus, customerOrderCreditRate, batches) values
                ('${quotationNo}', ${customerId}, '${date}',${total}, ${orderDiscount}, ${orderStatus},${customerOrderCreditRate}, '${bacthesObj}');`, (err,data) => {
                  connection.release();
                  if (err){
                    res.status(500).send(err);
                  }
                  else {
                    console.log(data)
                    res.status(200).send(quotationNo);
                  }
                      
              });

            }
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

  exports.getAllQuotationsfromDates = async(req, res) => {
    const quotation = {
      fromDate: req.query.fromDate,
      toDate: req.query.toDate
    }

    console.log(quotation);

    pool.getConnection((err, connection) => {
      if (err) {
          res.status(100).send({
              message: "Error in connection database"
            });
      }
      connection.query(`select * from quotation where date > '${quotation.fromDate} 00:00:00' and date < '${quotation.toDate} 23:59:59'  ;`, (err, rows) => {
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