const dotenv = require("dotenv");
const express = require("express");
const bodyParser = require("body-parser");
const { Server } = require("ws");
const WebSocket = require("ws");
const moment = require("moment");
const http = require("http");
const cors = require("cors");
const tz = require("moment-timezone");
const _ = require("lodash");

dotenv.config();

const Command = require("./app/models/command");
const Device = require("./app/models/device");
const Settings = require("./app/models/settings");
const User = require("./app/models/user");
const { minutesToMilliseconds, secondsToMilliseconds } = require("./utils");
const sendCommandWhenClientSendFeedback = require("./utils/functions");

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.get("/", (req, res) => {
  res.send("BeThere WebSocket - Home");
});

require("./app/controllers/index")(app); //importa controllers

const server = http.createServer(app);

const wss = new Server({ server });
let lastCommand;
// every device connection will be saved by serial key in loopkup array
const lookup = [];

wss.on("connection", async (ws, req) => {
  ws.isAlive = true;
  ws.send(`time#${moment().tz("America/Sao_Paulo").format("HH:mm")}`);

  ws.on("message", async (message) => {
    if (message.includes("BeThere is alive")) {
      const receivedSerialKey = message.split("$");
      if (receivedSerialKey) {
        ws.id = receivedSerialKey[1];
        lookup.push(ws.id);
      } else {
        ws.id = 'error to get device params';
      }

      console.log({lookup})

      const clientSerialKey = _.get(ws, 'id');
      const device = await Device.findOne({ deviceSerialKey: clientSerialKey});
      const deviceId =  _.get(device, 'id')
      deviceSettings = await Settings.findOne({ deviceId });

      if (deviceSettings) {
        const {
          backlight,
          pumpTimer,
          localMeasureInterval,
          remoteMeasureInterval,
          wateringRoutine,
          moistureSensor
        } = deviceSettings;
  
        const { enabled, startTime, endTime, interval, duration } =
          wateringRoutine;

        const { setPoint } = moistureSensor;
  
        if (enabled) {
          ws.send("WR_ON");
        } else {
          ws.send("WR_OFF");
        }
  
        ws.send("SETTINGS");
        const settingsString = `${backlight},${minutesToMilliseconds(
          pumpTimer
        )},${secondsToMilliseconds(localMeasureInterval)},${minutesToMilliseconds(
          remoteMeasureInterval
        )},${startTime},${endTime},${minutesToMilliseconds(
          duration
        )},${minutesToMilliseconds(interval)},${setPoint}`;
        ws.send(settingsString);
      }
    }

    if (message === "BeThere Home is alive!") {
      ws.id = `bethere_home_${ws.id}`;
    }

    console.log(
      `Received message from ${ws.id} time#${moment()
        .tz("America/Sao_Paulo")
        .format("HH:mm")} => ${message}`
    );

    // save last command to update bd if the client sends a different feedback message
    const isFeedbackMessage = message.includes("feedback#");
    const deviceIdFromSerial = await Device.findOne({ deviceSerialKey: ws.id });
    const userIdFromDevice = _.get(deviceIdFromSerial, "userId");

    if (lastCommand && lastCommand !== message && !isFeedbackMessage) {
      sendCommandWhenClientSendFeedback({
        commandFromRemote: message,
        userId: userIdFromDevice,
        deviceId: _.get(deviceIdFromSerial, "_id"),
        deviceSerialKey: ws.id,
      });
    }
    lastCommand = isFeedbackMessage
      ? message.substr(9, message.length)
      : message;
  });

  ws.on("close", () => {
    const findInLookup = _.find(
      lookup,
      (clientSerialConnected) => clientSerialConnected === ws.id
    );
    _.pull(lookup, findInLookup);
    console.log("Client disconnected");
    clearInterval(ws.timer);
    ws.terminate();
  });

  ws.timer = setInterval(function () {
    pingpong(ws);
  }, 30000);
});

function pingpong(ws) {
  if(ws.readyState === WebSocket.OPEN) {
    console.log(ws.id + " send a ping");
    ws.send(`time#${moment().tz("America/Sao_Paulo").format("HH:mm")}`);
    ws.ping("coucou", {}, true);
  }
  // console.log("Client disconnected");
  // clearInterval(ws.timer);
  // ws.terminate();
}

app.post("/send", async function (req, res) {
  const { userId, deviceId } = req.body;

  const user = await User.findOne({ _id: userId });
  if (!user)
    return res.send({ error: true, message: "Usuário não encontrado" });

  // check if the deviceId requested to send command exists
  const device = await Device.findOne({ _id: deviceId });

  if (!device)
    return res.send({ error: true, message: "Dispositivo não encontrado" });

  const userDevices = _.get(user, "devices"); // array of ids assigned to that user

  // check if the device is under user's collection
  let isDeviceFromThisUser;
  if (userDevices.length > 0) {
    isDeviceFromThisUser = userDevices.indexOf(deviceId);
  }

  if (isDeviceFromThisUser === -1)
    return res.send({ true: true, message: "Operação não autorizada" });

  // serial key from the localize the device in this context on ws clients
  const deviceSerialKey = _.get(device, "deviceSerialKey");
  const command = await Command.create(req.body);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      // send command only for the client requested
      if (deviceSerialKey === client.id) {
        client.send(req.body.commandName);
        if (req.body.commandName === "SETTINGS") {
          client.send(req.body.value);
        }

        if (req.body.commandName === "MP0") {
          client.send("WR_PUMP_OFF");
        }
      }
    }
  });
  res.send(command);
});

app.post("/ls-status", async function (req, res) {
  const { deviceSerialKey } = req.body;

  wss.clients.forEach((client) => {
    return client.id === deviceSerialKey;
  });

  const setFind = (set, cb) => {
    for (const e of set) {
      if (cb(e)) {
        return e;
      }
    }
    return undefined;
  };

  const isDeviceConnected = !!setFind(
    wss.clients,
    (e) => e.id === deviceSerialKey
  );

  res.send({ isDeviceConnected });
});

const port = 8080;

server.listen(process.env.PORT || port, () => {
  console.log(`Server running in the port ${port}`);
});
