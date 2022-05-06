const express = require("express");
const authMiddleWare = require("../middlewares/auth");
const Command = require("../models/command");
const router = express.Router();
const { COMMANDS } = require("../../utils/consts");

/* router.use(authMiddleWare); */

router.post("/laststatus", async (req, res) => {
  const { categoryName } = req.body;
  const lastCommand = await Command.find({ categoryName })
    .sort({ createdAt: -1 })
    .limit(1);
  res.send(lastCommand[0]);
});

router.post("/laststatus/all", async (req, res) => {
  const wateringRoutineMode = await Command.find({
    categoryName: COMMANDS.WATERING_ROUTINE_MODE.NAME,
  })
    .sort({ createdAt: -1 })
    .limit(1);
  const autoPump = await Command.find({
    categoryName: COMMANDS.WATERING_ROUTINE_PUMP.NAME,
  })
    .sort({ createdAt: -1 })
    .limit(1);
  const manualPump = await Command.find({
    categoryName: COMMANDS.MANUAL_PUMP.NAME,
  })
    .sort({ createdAt: -1 })
    .limit(1);
  res.send({
    wateringRoutineMode: wateringRoutineMode[0],
    autoPump: autoPump[0],
    manualPump: manualPump[0],
  });
});

router.post("/history", async (req, res) => {
  // need to add device id and user id checks here. Returning everything just to test.

  const { dayToRetrieveHistory, deviceId } = req.body;
  const historyForDate = await Command.find({
    deviceId,
    createdAt: {
      $gte: dayToRetrieveHistory,
    },
  });
  res.send({
    historyForDate,
  });
});

router.post("/delete", async (req, res) => {
  const { dayToRetrieveHistory } = req.body;
  const historyForDate = await Command.deleteMany({
    createdAt: {
      $gte: dayToRetrieveHistory,
    },
  });
  res.send({
    historyForDate,
  });
});

router.post("/delete-from-id", async (req, res) => {
  const { serialKey } = req.body;
  const dataFromId = await Command.deleteMany({ changedFrom: serialKey });
  res.send({
    dataFromId,
  });
});

module.exports = (app) => app.use("/commands", router);
