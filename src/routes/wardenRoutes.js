const express = require('express');
const wardenRoutes = express.Router()

const { postWarden, getWardenByid } = require('../controllers/wardenController');

wardenRoutes.route("/warden").post(postWarden);

wardenRoutes.route("/warden/:warden_id").get(getWardenByid);

module.exports = wardenRoutes