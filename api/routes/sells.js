const express = require("express");
const router = express.Router();

//MODEL
const Sell = require("../models/sell");

//MIDDLEWARE
const { checkAuth, checkAdm } = require("../middlewares/authentication");

//GET request - get sells
router.get("/admin/sells", [checkAuth, checkAdm], async (req, res) => {
  try {
    const sellsDB = await Sell.find()
      .populate("keyId", "userId")
      .populate("userId")
      .populate("keyId")
      .exec();

    return res.json({
      status: "success",
      data: sellsDB
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      error: error
    });
  }
});

router.get("/get-small-charts-data", checkAuth, async (req, res) => {
  try {
    const data = await Sell.find();

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

module.exports = router;
