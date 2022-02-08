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

module.exports = connection;