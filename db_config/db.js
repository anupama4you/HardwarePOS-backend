const mysql = require('mysql')
// const dbConfig = require('../../db_config/db.config')

// Create a connection pool to the database

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

module.exports = connect;