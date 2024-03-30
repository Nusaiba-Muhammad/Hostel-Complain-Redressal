const express = require("express");
import db from '../models';
const asyncWrapper=require('express-async-handler')


exports.postWarden = asyncWrapper(async (req, res)=> {
    try {
        const query = `insert into warden (
        warden_id, block_id) values
           ($1, $2) returning *`;
           
        const {  warden_id, block_id } = req.body;
  
        const warden = await db.pool.query(
          query, [ warden_id, block_id ]
        );
        res.json(warden.rows[0]);
    }catch(err) {
      console.log(err.message);
    }
});

exports.getWardenByid = asyncWrapper(async(req, res)=> {
    try {
        const {warden_id} = req.params;
        const warden = await db.pool.query(
          "select * from warden where warden_id = $1",
          [warden_id]
        );
        res.json(warden.rows)
      } catch (err) {
        console.log(err.message);
      }
});