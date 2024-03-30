const express = require("express");
import db from '../models';
const bcrypt = require("bcryptjs");
// const validInfo = require("../middleware/validInfo");
const asyncWrapper=require('express-async-handler')
const {jwtGenerator, jwtDecoder} = require("../utils/jwtToken");
const User = db.User;


exports.userRegister = (req, res) => {
  const { full_name, email, phone, password, type } = req.body;
  console.log(req.body, 'NUSAIBA IYA');
 let newUser =  req.body
    
    User.findAll({ where: { email } }).then(user => {
      if (user.length) {
        return res.status(400).json({ email: 'Email already exists!' });
      } 

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          User.create(newUser)
            .then(user => {
              console.log(user.dataValues, "SLLSLSLS")
              const new_user = user.dataValues 
              if (type === "student") {
                const { block_id, usn, room } = req.body;
                const insertStudentQuery = `
                  INSERT INTO student (student_id, block_id, usn, room)
                  VALUES (${new_user.id}, '${block_id}', '${usn}', '${room}');
                `;
                 db.sequelize.query(insertStudentQuery);
              } else if (type === "warden") {
                const { block_id } = req.body;
                const insertWardenQuery = `
                  INSERT INTO warden (warden_id, block_id)
                  VALUES (${new_user.id}, '${block_id}');
                `;
                 db.sequelize.query(insertWardenQuery);
              } else if (type === "worker") {
                const insertWorkerQuery = `
                  INSERT INTO worker (worker_id, category_id)
                  VALUES (${new_user.id}, NULL);
                `;
                 db.sequelize.query(insertWorkerQuery);
              }
              res.json({ user: new_user, success: true });
            })
            .catch(err => {
              res.status(500).json({ err });
            });
        });
      });
    
    });
    

    // return res.json({ jwtToken, data: user.rows[0], success: true });
  }  


exports.userLogin = asyncWrapper(async (req, res) => {
  const { email, password } = req.body;

  try {
    const userCheckQuery = `SELECT * FROM users WHERE email = '${email}'`;
    const user = await db.sequelize.query(userCheckQuery);
    console.log(user[0][0].user_id, "JDJD")
    const new_user = user[0][0]
    if (user[0].length === 0) {
      return res.status(401).json("Invalid Credential");
    }

    const validPassword = await bcrypt.compare(password, new_user.password);

    if (!validPassword) {
      return res.status(401).json("Invalid Credential");
    }

    const jwtToken = jwtGenerator(new_user.user_id, new_user.type);
    console.log(jwtDecoder(jwtToken))
    return res.json({ jwtToken, data: new_user, success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});
