const express = require("express");
import db from '../models';
const asyncWrapper=require('express-async-handler')


exports.postWorkers = asyncWrapper(async(req, res) => {
    try {
        const query = `insert into workers (
         worker_id, category_id) values
           ($1, $2) returning *`;
           
        const {  worker_id, category_id } = req.body;
  
        const workers = await db.pool.query(
          query, [ worker_id, category_id ]
        );
        res.json(workers.rows[0]);
    }catch(err) {
      console.log(err.message);
    }
  });

  exports.getWorkersByid = asyncWrapper(async(req, res)=> {
    try {
        const {worker_id} = req.params;
        const workers = await db.pool.query(
          "select * from workers where worker_id = $1",
          [worker_id]
        );
        res.json(workers.rows)
      } catch (err) {
        console.log(err.message);
      }
  });