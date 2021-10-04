const User = require('../models/user.model.js')
const pool = require('../models/db')
const userFirebase = require('../controllers/user.firebase');
const userModel = require('../models/user.model')
const userService = require('./user.firebase')

/**** create new user ********/
exports.create = async (req, res) => {

  const userRoleType = await getUserRoleTypeFromToken(req.headers.authorization)
  let firebaseId = null;

  console.log(req.body)

  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  if(userRoleType === 1){
    await userService.create(req.body).then(
      (firebaseResponse) => {
        firebaseId = firebaseResponse.uid;
        console.log(firebaseId);
      }
    ).catch((error) => {
      console.log(error.message);
      res.send(error.message);
    });

  }else{
    res.status(500).send({
      message:
        "Invalid user."
    });
  }

  const Adduser = {
    name : req.body.name,
    user_email : req.body.user_email,
    user_role_type : req.body.user_role_type,
    shop_id : req.body.shop_id,
    user_status : req.body.user_status,
    user_firebase_uid : firebaseId
  }

  if(firebaseId){
      // Save User in the database
      await User.addUser(Adduser, (err, data) => {
        if (err)
          res.status(500).send({
            message:
              err.message || "Some error occurred while creating the User."
          });
        else res.send(data);
      });
  }
  
};

/**** Get one user ********/
exports.findOne = async(req, res) => {
  if (!req.params.firebaseId) {
    res.status(400).send({
      message: "User id is mandatory!"
    });
  }

  // const user = new User({
  //   user_firebase_uid: null,
  //   email: null,
  //   user_role_type: null,
  //   shop_id: null,
  //   user_status: null
  // });

  // await userService.getUserById(req.params.firebaseId).then(
  //   (firebaseResponse) => {
  //     user.email = firebaseResponse.email;
  //   }
  // ).catch((error) => {
  //   res.status(500).send({
  //     message: "Error retrieving User with id from firebase:" + req.params.firebaseId
  //   });
  // });

  await User.findByFirebaseId(req.params.firebaseId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found User with id ${req.params.firebaseId}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving User with id " + req.params.firebaseId
        });
      }
    } else {
        res.send(data);
    }
  });
};

// Retrieve all Users from the database.
exports.findAll = async(req, res) => {
  const userRoleType = await getUserRoleTypeFromToken(req.headers.authorization)

  pool.getConnection((err, connection) => {
    if (err) {
        res.status(100).send({
            message: "Error in connection database"
          });
    }

    if((userRoleType) == 1){
      connection.query(`SELECT * FROM users`, (err, rows) => {
        connection.release();
        if (err)
            res.status(500).send({
              message:
                err.message || "Some error occurred while retrieving items."
            });
          else res.send(rows);
      });
    }else{
        res.status(500).send({
          message:
            "Invalid user."
        });
    }

  });
};

const getUserRoleTypeFromToken = async(idToken) => {
      const authUser =  await userFirebase.verifyIdToken(idToken);
      const user =  await userModel.findByFirebaseId(authUser);
      const userRole = user[0].user_role_type;
      // console.log(userRole) ; // 1 --> super admin | 2 --> Normal user
      return userRole;
}

exports.updateByFirebaseId = async(req, res) => {
  const userRoleType = await getUserRoleTypeFromToken(req.headers.authorization);

    if((userRoleType) == 1){
       await userModel.updateUserById(req.params.firebaseId, req.body).then(
        (firebaseResponse) => {
          console.log("Successfully updated user in DB")
        }
      ).catch((error) => {
        res.send(error);
      });
       
       await userService.update(req.params.firebaseId, req.body).then(
        (firebaseResponse) => {
          console.log("Successfully updated user in Firebase")
          res.status(200).send({
            message: "Successfully updated user:" + req.params.firebaseId
          });
        }
      ).catch((error) => {
        console.log(error);
        res.send(error);
      });

    }else{
      res.status(500).send({
        message:
          "Invalid user."
      });
    }
};

  exports.deleteByFirebaseId = async(req, res) => {
    const userRoleType = await getUserRoleTypeFromToken(req.headers.authorization);

    if((userRoleType) == 1){
    // Validate Request
      if (!req.params.firebaseId) {
        res.status(400).send({
          message: "User ID cannot be empty!"
        });
      }

      await User.deleteUser(req.params.firebaseId, (err, data) => {
        if (err) {
          if (err.kind === "not_found") {
            res.status(404).send('Not Found')
          } else {
            res.send("Error retrieving User")
          }
        } else {
            console.log('successfully deleted user from DB');
        }
      });

          await userService.deleteByFirebaseId(req.params.firebaseId).then(
            (firebaseResponse) => {
              res.send(firebaseResponse);
            }
          ).catch((error) => {
            console.log(error)
            res.send(error);
          });

    }else{
      res.status(500).send({
        message:
          "Invalid user."
      });
    }
  };

  exports.getAuth = async (req, res) => {
    const result = await userService.verifyIdToken();
    res.send(result);
  };