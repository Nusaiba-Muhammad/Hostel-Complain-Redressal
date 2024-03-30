
const { postComplaints,putComplaintsByid, getAllComplaintsByUser, getUserType, getUserDetails, deleteComplaints } = require("../controllers/complaintController");

module.exports = (app) => {
    // create a new user
    app.post(
      '/complaints',postComplaints
    );
    app.get(
        '/complaints',getAllComplaintsByUser
      );
      app.get(
        '/complaints:/id',putComplaintsByid
      );
    app.get(
      '/userType',getUserType
      );
      app.get(
        '/userDetails/:id',getUserDetails
      );
      app.delete(
        '/complaints/:id',deleteComplaints
      );
  
  };