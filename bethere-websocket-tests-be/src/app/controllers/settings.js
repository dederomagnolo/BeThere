const express = require("express");
const authMiddleWare = require("../middlewares/auth");
const _ = require("lodash");

const User = require("../models/user");
const Device = require("../models/device");
const Settings = require("../models/settings");
const router = express.Router();

/* router.use(authMiddleWare); */
router.post("/", async (req, res) => {
  try {
    const { deviceId } = req.body;
    const settingsFromDevice = await Settings.find({ deviceId });
    return res.send({ settingsFromDevice });
  } catch (err) {
    return res.status(400).send({ error: err.message });
  }
});

router.post("/new", async (req, res) => {
  try {
    const {
      userId,
      deviceId,
      settingsName,
      backlight,
      pumpTimer,
      localMeasureInterval,
      remoteMeasureInterval,
      wateringRoutine,
      moistureSensor,
    } = req.body;
    const user = await User.find({ _id: userId });
    const device = await Device.findOne({ _id: deviceId });
    // need to match device with user here, before to create the new setting
    if (user && device) {
      const newSettings = await Settings.create({
        deviceId,
        settingsName,
        backlight,
        pumpTimer,
        localMeasureInterval,
        remoteMeasureInterval,
        wateringRoutine,
        moistureSensor,
      });

      device.settings.push(newSettings);
      device.save();
      return res.send("Created with success");
    } else {
      res.status(400).send("User or device not found");
    }
  } catch (err) {
    return res.status(400).send({ error: err.message });
  }
});

router.post("/edit", async (req, res) => {
  try {
    const {
      settingsId,
      settingsName,
      backlight,
      pumpTimer,
      localMeasureInterval,
      remoteMeasureInterval,
      wateringRoutine,
      moistureSensor,
    } = req.body;

    const { duration, interval, startTime, endTime, enabled } = wateringRoutine;
    const setPoint = _.get(moistureSensor, 'setPoint');
    const moistureAutomationEnabled = _.get(moistureSensor, 'enabled');
    const currentSettings = await Settings.findOne({ _id: settingsId });

    const dataToUpdate = {
      settingsName: settingsName || currentSettings.settingsName,
      backlight: backlight || currentSettings.backlight,
      pumpTimer: pumpTimer || currentSettings.pumpTimer,
      localMeasureInterval: localMeasureInterval || currentSettings.localMeasureInterval,
      remoteMeasureInterval: remoteMeasureInterval || currentSettings.remoteMeasureInterval,
      wateringRoutine: {
        enabled,
        duration,
        interval,
        startTime,
        endTime,
      },
      moistureSensor: {
        enabled: moistureAutomationEnabled,
        setPoint: setPoint || currentSettings.moistureSensor.setPoint,
      },
    };

    await Settings.findOneAndUpdate(
      { _id: settingsId },
      {
        $set: dataToUpdate,
      }
    );

    res.status(200).send("Updated!");
  } catch (err) {
    console.log(err);
  }
});

module.exports = (app) => app.use("/settings", router);
