const express = require("express");
// const userRoutes = express.Router();

const { userRegister, userLogin } = require('../controllers/userController')
// const { authorizeWarden, authorizeStudent, authorizeWorker, authorizeComplaintRoute } = require('../middleware/auth')



module.exports = (app) => {
  // create a new user
  app.post(
    '/register',userRegister
  );

  app.post(
    '/login',userLogin
    );
    app.post(
      '/warden',userRegister
    );

};

