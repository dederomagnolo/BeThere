const express = require("express");
const authMiddleWare = require("../middlewares/auth");
const Plan = require("../models/plan");
const router = express.Router();

/* router.use(authMiddleWare); */

router.post('/populate' , async(req, res) => {
  const { planName } = req.body;

  const newPlan = {
    planName
  }

  await Plan(newPlan).save();
  return res.send({ message: `Plan ${planName} added to database.`});
});

module.exports = (app) => app.use("/plans", router);
