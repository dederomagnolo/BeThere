const express = require("express");
const _ = require("lodash");
const authMiddleWare = require("../middlewares/auth");
const Device = require("../models/device");
const Addon = require("../models/addon");
const Plan = require("../models/plan");
const User = require("../models/user");
const router = express.Router();
const {generateProductKey} = require('../../utils');
/* router.use(authMiddleWare); */

router.post("/assign", async (req, res) => {
  const { addonId, deviceId, userId } = req.body;
  
  const user = await User.findOne({ _id: userId});
  const device = await Device.findOne({ _id: deviceId});

  // check if user and device exists
  if(!user) return res.send({message: "Usuário não encontrado", error: true});
  if(!device) return res.send({message: "Dispositivo não encontrado", error: true});
  
  // check if the given device is assigned to this user
  const userDevices = _.get(user, 'devices');
  let isDeviceFromThisUser;
  if(userDevices.length > 0) {
    isDeviceFromThisUser = userDevices.indexOf(deviceId);
  }

  if(isDeviceFromThisUser === -1)
    return res.send({true: true, message: "Operação não autorizada"});

  // TODO:need to add a check for user plan here
  
  // check if the addon is available
  const productAvailable = await Addon.findOne({_id: addonId, available: true});
  device.addons.push(productAvailable);
  device.save();

  return res.send({
    message: `Addon atribuído ao dispositivo ${device.deviceSerialKey}`
  });
});

router.post('/populate' , async(req, res) => {
  const { type, model, range, availableForPlans } = req.body;
  const plans = _.map(availableForPlans, (plan) => {
    return { planName: plan }
  })

  let plansFromDb = []
  await Plan.find().or(plans).then((docs) => {
    plansFromDb = docs
  }).catch(err => console.log(err))
  
  if(plansFromDb.length !== availableForPlans.length) {
    // enhance here and send the plan name that is given and not exists in the db
    return res.send({ 
      message: `Plano fornecido não existe`,
      error: true
    });
  }

  const newProductKey = generateProductKey(1);

  const newAddon = {
    type,
    characteristics: {
      model,
      range
    },
    availableForPlans: _.map(plansFromDb, (plan) => plan._id),
    productKey: newProductKey
  }

  await Addon(newAddon).save();
  return res.send({ 
    message: `Added ${type} ${model} to database.`
  });
});

module.exports = (app) => app.use("/addons", router);
