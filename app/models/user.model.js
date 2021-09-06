const connect = require('./db')

// constructor
const User = function(user) {
    this.user_firebase_uid = user.user_firebase_uid;
    this.email = user.email,
    this.password = user.password,
    this.user_role_type = user.user_role_type;
    this.user_status = user.user_status;
    this.shop_id = user.shop_id;
  };

  //add users
  User.addUser = async (newUser, result) => {
    connect.getConnection((err, connection) => {
      if(err) throw err;
   
    connect.query("INSERT INTO users SET user_firebase_uid =?, user_email=?, user_role_type=?, shop_id=?, user_status=?",
    [newUser.user_firebase_uid, newUser.email, newUser.user_role_type, newUser.shop_id, newUser.user_status], (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
  
      console.log("created user: ", { id: res.insertId, ...newUser });
      result(null, { id: res.insertId, ...newUser });
      });
  });
  };

  //get all users
  User.getAllUsers = async result => {
    connect.getConnection((err, connection) => {
      if(err) throw err;
    connect.query("SELECT * FROM users", (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }
  
      console.log("users: ", res);
      result(null, res);
    });
  });
  };

  //get user by firebase id
  User.findByFirebaseId = async(user_firebase_uid, result) => {
    console.log(user_firebase_uid);
    connect.getConnection((err, connection) => {
      if(err) throw err;
    connect.query(`SELECT * FROM users WHERE user_firebase_uid = ?`,[user_firebase_uid], (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
  
      if (res.length) {
        result(null, res[0]);
        return;
      }
  
      // not found User with the id
      result({ kind: "not_found" }, null);
    });
  });
  };

  //get user by user id
  User.findByUserId = async (user_id, result) => {
    connect.getConnection((err, connection) => {
      if(err) throw err;
    connect.query(`SELECT * FROM users WHERE user_id = ${user_id} LIMIT 1`, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
  
      if (res.length) {
        console.log("found user: ", res[0]);
        result(null, res[0]);
        return;
      }
  
      // not found User with the id
      result({ kind: "not_found" }, null);
    });
  });
  };

  //update user
  User.updateUserById = (id, user, result) => {
    console.log(id)
    connect.getConnection((err, connection) => {
      if(err) throw err;
    connect.query(
      "UPDATE users SET user_email=?, user_role_type = ?, SHOP_ID = ?, user_status = ? WHERE user_firebase_uid = ?",
      [user.email, user.user_role_type, user.shop_id, user.user_status, id],
      (err, res) => {
        if (err) {
          console.log("error: ", err);
          result(null, err);
          return;
        }
  
        if (res.affectedRows == 0) {
          // not found User with the id
          result({ kind: "not_found" }, null);
          return;
        }
  
        console.log("updated user: ", { id: id, ...user });
        result(null, { id: id, ...user });
      });
    });
    };
  
    User.deleteUser = async(id, result) => {
      connect.getConnection((err, connection) => {
        if(err) throw err;
      connect.query("DELETE FROM users WHERE user_firebase_uid = ?", id, (err, res) => {
        if (err) {
          console.log("error: ", err);
          result(null, err);
          return;
        }
    
        if (res.affectedRows == 0) {
          // not found User with the id
          result({ kind: "not_found" }, null);
          return;
        }
    
        console.log("deleted user with id: ", id);
        result(null, res);
      });
    });
    };

  module.exports = User;