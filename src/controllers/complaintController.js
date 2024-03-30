const db = require('../models');
const asyncWrapper = require('express-async-handler');
const jwt = require("jsonwebtoken");

const decodeUser = async (token) => {
  try {
    const decodedToken = jwt.verify(token, process.env.JWTSECRET);
    console.log(decodedToken);
  
    const { user_id, type } = decodedToken.user;
    let userInfo;

    if (type === "student") {
      const query = `
        SELECT student_id, room, block_id
        FROM student 
        WHERE student_id = '${user_id}'
      `;
      const result = await db.sequelize.query(query);
      console.log(result, "SKKKDKD");
      if (result.rows.length > 0) {
        userInfo = result.rows[0];
      }
    }

    if (type === "warden") {
      const query = `
        SELECT warden_id,  block_id
        FROM warden 
        WHERE warden_id = '${user_id}'
      `;
      const result = await db.sequelize.query(query);
      if (result.rows.length > 0) {
        userInfo = result.rows[0];
      }
    }
    
    return userInfo;

  } catch (err) {
    console.error("here111", err.message);
    throw new Error("Unauthorized");
  }
};

exports.postComplaints = asyncWrapper(async (req, res) => {
  try {
    const token = req.headers.authorization;
    console.log(token);
    const userInfo = await decodeUser(token);
    const { student_id, block_id } = userInfo;
    const { name, description, room } = req.body;

    const query = `
      INSERT INTO complaint (name, block_id, student_id, description, room, is_completed, created_at, assigned_at) 
      VALUES ('${name}', '${block_id}', '${student_id}', '${description}', '${room}', false, CURRENT_TIMESTAMP, NULL)
    `;

    const newComplaint = await db.sequelize.query(query);
    res.json(newComplaint.rows[0]);
  } catch (err) {
    console.log(err.message);
    res.status(500).json("Server error");
  }
}); 

exports.putComplaintsByid = asyncWrapper(async (req, res) => {
  const token = req.headers.authorization;
  const decodedToken = jwt.verify(token, process.env.JWTSECRET);
  console.log(decodedToken);
  const { user_id, type } = decodedToken.user;

  try {
    const { id } = req.params;

    if (type === "warden") {
      const result = await db.sequelize.query(
        `UPDATE complaint SET is_completed = NOT is_completed, assigned_at = CURRENT_TIMESTAMP WHERE id = '${id}'`
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Complaint not found" });
      }

      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: "Complaint not found" });
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

exports.getAllComplaintsByUser = asyncWrapper(async (req, res) => {
  const token = req.headers.authorization;
  console.log(token);
  const decodedToken = jwt.verify(token, process.env.JWTSECRET);
  console.log(decodedToken);

  const { user_id, type } = decodedToken.user;

  try {
    if (type === "warden") {
      const allComplaints = await db.sequelize.query("SELECT * FROM complaint ORDER BY created_at DESC");
      
      res.json(allComplaints[0]);
    } else if (type === "student") {
      const myComplaints = await db.sequelize.query(
        `SELECT * FROM complaint WHERE student_id = '${user_id}' ORDER BY created_at DESC`
      );
      res.json(myComplaints[0]);
    } else {
      res.status(403).json({ error: "Unauthorized" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

exports.getUserType = asyncWrapper(async (req, res) => {
  try {
    const token = req.headers.authorization;
    console.log(token);
    const decodedToken = jwt.verify(token, process.env.JWTSECRET);
    console.log(decodedToken)
    const { type } = decodedToken.user;

    res.json({ userType: type });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

exports.getUserDetails = async (req, res) => {
  try {
    const token = req.headers.authorization;
    console.log(token);
    const decodedToken = jwt.verify(token, process.env.JWTSECRET);
    console.log(decodedToken)
    const { user_id, type } = decodedToken.user;
    const { id } = req.params;

    console.log('Decoded Token:', decodedToken);
    console.log('User Type:', type);
    console.log('User ID:', user_id);

    let detailsQuery = '';
    if (type == 'student') {
      detailsQuery = `
        SELECT u.full_name, u.email, u.phone, s.usn, b.block_id, b.block_name, s.room
        FROM users u, student s, block b
        WHERE u.user_id = '${user_id}' AND u.user_id = s.student_id AND s.block_id = b.block_id
      `;
    } else if (type == 'warden') {
      detailsQuery = `
        SELECT u.full_name, u.email, u.phone
        FROM users u 
        WHERE user_id='${user_id}'
      `;
    }

    const userDetail = await db.sequelize.query(detailsQuery);
    res.json(userDetail.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deleteComplaints = async (req, res) => {
  try {
    const token = req.headers.authorization;
    console.log(token);
    const decodedToken = jwt.verify(token, process.env.JWTSECRET);
    console.log(decodedToken)
    const { type } = decodedToken.user;
    const { id } = req.params;

    if (type == 'warden') {
      const deleteComplaint = await db.sequelize.query(`DELETE FROM complaint WHERE id = '${id}'`);
      res.json("Complaint deleted");
    } else {
      res.status(403).json({ error: "Unauthorized" });
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
