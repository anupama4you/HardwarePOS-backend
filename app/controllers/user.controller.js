const User = require('../models/user.model.js')
const userService = require('./user.firebase')

/**** create new user ********/
exports.create = async (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  const user = new User({
    user_firebase_uid: null,
    email: req.body.email,
    password : req.body.password,
    user_role_type: req.body.user_role_type,
    shop_id: req.body.shop_id,
    user_status: req.body.user_status
  });

  const firebaseUser = await userService.create(user)

  // Save User in the database
  await User.addUser(firebaseUser, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the User."
      });
    else res.send(data);
  });
  
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
    await User.getAllUsers((err, data) => {
        if (err)
          res.status(500).send({
            message:
              err.message || "Some error occurred while retrieving customers."
          });
        else res.send(data);
      });
};

exports.updateByFirebaseId = async (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  await userService.update(req.params.firebaseId, new User(req.body)).then(
    (firebaseResponse) => {
      console.log('********successfully updated user');
      console.log(firebaseResponse);
    }
  ).catch((error) => {
    res.status(500).send({
      message: "Error updating User with id from firebase:" + req.params.firebaseId
    });
  });

  User.updateUserById(
    req.params.firebaseId,
    new User(req.body),
    (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found User with id ${req.params.firebaseId}.`
          });
        } else {
          res.status(500).send({
            message: "Error updating User with id " + req.params.firebaseId
          });
        }
      } else res.send(data);
    }
  );};

  exports.deleteByFirebaseId = async(req, res) => {
    // Validate Request
  if (!req.params.firebaseId) {
    res.status(400).send({
      message: "User ID cannot be empty!"
    });
  }

    await userService.deleteByFirebaseId(req.params.firebaseId).then(
      (firebaseResponse) => {
        console.log('********successfully deleted user');
      }
    ).catch((error) => {
      res.status(500).send({
        message: "Error deleting User with id from firebase:" + req.params.firebaseId
      });
    });

    await User.deleteUser(req.params.firebaseId, (err, data) => {
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