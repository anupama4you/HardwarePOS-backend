const mysql = require('mysql')
const dbConfig = require('./db.config')

// Create a connection pool to the database
const connection = mysql.createConnection({
	host: dbConfig.HOST,
	user: dbConfig.USER,
	password: dbConfig.PASSWORD,
	database: dbConfig.DB,
});

// open the mysql connection
connection.connect(error => {
    if (error) {
      console.error('error connecting: ' + error.stack);
      return;
    }
    console.log('successfully conntected to database with connection id ' + connection.threadId);
  });

// const connect = mysql.createPool({
//     host: process.env.HOST,
//     user: process.env.USER,
//     password: process.env.PASSWORD,
//     database: process.env.DB
// });

// // // open the MySQL connection
// connect.getConnection((err, connection) => {
//     if(err) throw err;
//     console.log('connected as id ' + connection.threadId);
//     connection.query('SELECT * from users LIMIT 1', (err, rows) => {
//         connection.release(); // return the connection to pool
//         if(err) throw err;
//         console.log('The data from users table are: \n', rows);
//     });
// });

module.exports = connection;