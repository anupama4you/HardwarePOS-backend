var admin = require("firebase-admin");
var userController = require('./user.controller')
const User = require('../models/user.model')

var serviceAccount = require("../../hardwarepos-a7d06-firebase-adminsdk-r511t-e13f630ea2.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

class UserService{

  /******** Get User By ID *******/
	async getUserById(uid) {
    
		return await admin.auth().getUser(uid)

	}

	/******** Get All Users *******/
	async getAllUsers() {
		return await UserSchema.find().sort({ createdDate: -1 });
	}

  /******** Update User *******/
	async update(uid, user) {

    console.log(uid)

      // Check user status
			return await admin.auth().updateUser(uid, 
        {
            email : user.user_email,
            disabled : !user.user_status,
            displayName : user.name,
        });
	}

  /******** Create User *******/
  async create(user) {
      return await admin
        .auth()
        .createUser({
          email: user.user_email,
          displayName: user.name,
          password: user.password,
          disabled: !user.user_status
        });
    }

  // const listAllUsers = (nextPageToken) => {
  //   // List batch of users, 1000 at a time.
  //   admin
  //     .auth()
  //     .listUsers(1000, nextPageToken)
  //     .then((listUsersResult) => {
  //       listUsersResult.users.forEach((userRecord) => {
  //         console.log('user', userRecord.toJSON());
  //       });
  //       if (listUsersResult.pageToken) {
  //         // List next batch of users.
  //         listAllUsers(listUsersResult.pageToken);
  //       }
  //     })
  //     .catch((error) => {
  //       console.log('Error listing users:', error);
  //     });
  // };
  // // Start listing users from the beginning, 1000 at a time.
  // listAllUsers();

  /******** Delete User *******/
	async deleteByFirebaseId(uid) {
		// Get user by ID
		return await admin.auth().deleteUser(uid)
    
	}

  async verifyIdToken(idToken) {
    //
    const res = new Promise((resolve, reject) => {
      // eslint-disable-next-line
      admin.auth().verifyIdToken(idToken)
      // eslint-disable-next-line
      .then((decodedToken) => {
          // eslint-disable-next-line
          const uid = decodedToken.uid;
          resolve(uid);
          // eslint-disable-next-line
        }).catch((error) => {
          reject(error);
        });
    });
    return res;
  }

}

module.exports = new UserService();