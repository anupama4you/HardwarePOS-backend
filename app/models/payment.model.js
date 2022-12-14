const sql = require('../../db_config/db');

const Payment = function (payment) {};

Payment.addPayment = async (payment, res) => {
	const result = await Payment.addPaymentQuery(payment);
	if (result.affectedRows > 0) {
		result.code = 200;
	} else {
		result.code = 100;
	}
	return result;
};

  Payment.addPayment = async (payment, res) => {
    const result = await Payment.addPaymentQuery(payment);
    if (result.affectedRows > 0) {
      result.code = 200;
    } else {
      result.code = 100;
    }
    console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxx ', result.code);
    return result;
  }

  Payment.addPaymentQuery = async ({
    date, remark, amount, type, custOrderId, checqueNo, checqueDate,
  }) => {
    console.log(date, remark, amount, type, custOrderId, checqueNo, checqueDate);
    const result = await new Promise((resolve, reject) => {
      sql.query(
        'INSERT INTO customer_payment VALUES (null,?,?,?,?,?,?,?)',
        [
          date,
          remark,
          amount,
          type,
          custOrderId,
          checqueNo,
          checqueDate,
        ],
        (paymentAddErr, paymentAddResult) => {
          if (paymentAddErr) {
            reject(paymentAddErr);
          } else {
            resolve(paymentAddResult);
          }
        },
      );
      sql.query(
        `update customer_order co set co.customer_order_paid = (co.customer_order_paid+${amount})
        where co.idcustomer_order =${custOrderId}`,
        (paymentAddErr, paymentAddResult) => {
          
          if (paymentAddErr) {
            throw paymentAddErr;
          } else {
            resolve(paymentAddResult);
          }
        },
      );
    });
    return result;
  };

module.exports = Payment;
