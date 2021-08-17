const express = require("express");
const router = express.Router();

//MODEL
const Money = require("../models/moneyrecauded");

//MIDDLEWARE
const { checkAuth, checkAdm } = require("../middlewares/authentication");

//GET MONEYRECAUDED
router.get("/admin/money", [checkAuth, checkAdm], async (req, res) => {
  try {
    const moneyDB = await Money.find().populate("userId");

    return res.json({
      status: "success",
      data: moneyDB
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      error: error
    });
  }
});


router.get("/get-money-recauded", [checkAuth, checkAdm], async (req, res) => {
    try {
      const data = await Money.find();
      const response = {
        status: "success",
        data: data
      };
  
      return res.json(response);
    } catch (error) {
      console.log(error);
  
      const response = {
        status: "error",
        error: error
      };
  
      return res.json(response);
    }
  });


module.exports = router