const sql = require('../../db_config/db')

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

    sql.query(`select * from quotation ORDER BY quotation_id DESC LIMIT 1;`, (err, row) => {
      if (err)
        res.status(500).send({message : err});
        else {
          if(row[0]){
            quotationNo = 'QU_' + (parseInt(row[0].quotation_id)+1)
          }else{
            quotationNo = 'QU_' + 1
          }
          console.log(quotationNo);

          sql.query(`insert into quotation (quotation_no, customerId, date, total, orderDiscount, orderStatus, customerOrderCreditRate, batches) values
            ('${quotationNo}', ${customerId}, '${date}',${total}, ${orderDiscount}, ${orderStatus},${customerOrderCreditRate}, '${bacthesObj}');`, (err,data) => {
              if (err){
                console.log(err);
                res.status(500).send({message : err});
              }
              else {
                console.log(data)
                res.status(200).send(quotationNo);
              }
                  
          });

        }
    });
  };

  exports.getQuotationByNo = async(req, res) => {
    console.log(req.params.quotationNo)
    const quotationNo = req.params.quotationNo;
    sql.query(`select * from quotation q, customer c where q.customerId = c.idcustomer and q.quotation_no = '${quotationNo}' ;`, (err, rows) => {
      if (err)
          res.status(500).send({
            message: err
          });
        else {
          if(rows.length == 0){
            res.status(404).send({message: 'Quotation cannot be found'});
          }else{
             res.status(200).send(rows);
          }
        }
    });
  };

  exports.getAllQuotations = async(req, res) => {
    sql.query(`select * from quotation;`, (err, rows) => {
      if (err)
          res.status(500).send({
            message: err
          });
        else res.send(rows);
    });
  };

  exports.getAllQuotationsfromDates = async(req, res) => {
    const quotation = {
      fromDate: req.query.fromDate,
      toDate: req.query.toDate
    }

    console.log(quotation);

    sql.query(`select * from quotation where date > '${quotation.fromDate} 00:00:00' and date < '${quotation.toDate} 23:59:59'  ;`, (err, rows) => {
      if (err)
          res.status(500).send({
            message: err
          });
        else res.send(rows);
    });
  };
