const dotenv = require('dotenv');
const express = require('express');
const bodyParser = require('body-parser');
const { Server } = require('ws');
const WebSocket = require('ws');
const moment = require('moment');
const http = require('http');
const cors = require('cors');
const tz = require('moment-timezone');
const _ = require('lodash');

dotenv.config();

const Command = require('./app/models/command');
const Device = require('./app/models/device');
const Settings = require('./app/models/settings');
const User = require('./app/models/user');
const {minutesToMilliseconds, secondsToMilliseconds} = require('./utils');

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(cors());

app.get('/', (req, res) => {
    res.send("BeThere WebSocket - Home");
});

require('./app/controllers/index')(app); //importa controllers

const server = http.createServer(app);

const wss = new Server({ server });
let lastCommand;
const lookup = [];

wss.on('connection' , async (ws, req) => {
    const receivedUrl = req.url;
    let paramsSplitted;
    
    // check url params to get device serial key
    if(req.url) {
        const receivedParamsFromDevice = receivedUrl.split('/?');
        console.log(receivedParamsFromDevice);
        if(receivedParamsFromDevice) {
            paramsSplitted = receivedParamsFromDevice[1].split('=');
        }
    }

    ws.isAlive = true;
    ws.send('Server touched!');
    ws.send(`time#${moment().tz('America/Sao_Paulo').format('HH:mm')}`);
    // change ws id to serial key if it exists
    if(paramsSplitted.length > 0) {
        ws.id = paramsSplitted[1];
        lookup.push(ws.id);
    } else {
        ws.id = 'error to get device params';
    }

    // send command
    // search serial key to send settings
    const device = await Device.findOne({deviceSerialKey: ws.id});
    let deviceSettings;
    if(device) {
        deviceSettings = await Settings.findOne({deviceId: device.id});
    }

    if(deviceSettings) {
        const {
            backlight, 
            pumpTimer, 
            localMeasureInterval,
            remoteMeasureInterval,
            wateringRoutine
        } = deviceSettings;

        const {
            enabled, 
            startTime, 
            endTime, 
            interval, 
            duration
        } = wateringRoutine;

        if(enabled) {
            ws.send('WR_ON');
        } else {
            ws.send('WR_OFF');
        }

        ws.send('SETTINGS');
        const settingsString = `${backlight},${minutesToMilliseconds(pumpTimer)},${secondsToMilliseconds(localMeasureInterval)},${minutesToMilliseconds(remoteMeasureInterval)},${startTime},${endTime},${minutesToMilliseconds(duration)},${minutesToMilliseconds(interval)}`;
        console.log(settingsString);
        ws.send(settingsString);
    }

    ws.on('message', async (message) => {
        const userIdFromDevice = _.get(device, 'userId');
        console.log(lookup);
        /* let deviceSerialKey = message.substr(0,2);
        if (deviceSerialKey === "$S") {
            deviceSerialKey = message.substr(2,deviceSerialKey.lenght);
            const deviceFound = await Device.findOne({deviceSerialKey});
            if(deviceFound) {
                const deviceSettings = await Settings.findOne({_id: deviceFound.settings[0]});
                ws.send("authenticated!");
                ws.send("SETTINGS");
                ws.send(`
                    ${deviceSettings.backlight},
                    ${minutesToMilliseconds(deviceSettings.pumpTimer)},
                    ${secondsToMilliseconds(deviceSettings.localMeasureInterval)},
                    ${minutesToMilliseconds(deviceSettings.remoteMeasureInterval)}, 
                `);
            } else {
                ws.send("not authenticated!");
                ws.close();                
                // need to add here the call for settings of authenticated device
                // need to send the variables as string in websocket message
            }
        } */

        if(message === 'BeThere Home is alive!') {
            ws.id = `bethere_home_${ws.id}`;
        }

        console.log(`Received message from ${ws.id}=> ${message}`);
        // save last command to only update bd if the client sends a different feedback message
        
        if(lastCommand != message) {
            if(message === "MP0") {
                await Command.create({
                    "categoryName": "Manual Pump",
                    "commandName": "MP0",
                    "changedFrom": ws.id,
                    "userId": userIdFromDevice,
                    "deviceId": ws.id
                });
            }

            if(message === "MP1") {
                await Command.create({
                    "categoryName": "Manual Pump",
                    "commandName": "MP1",
                    "changedFrom": ws.id,
                    "userId": userIdFromDevice,
                    "deviceId": ws.id
                });
            }
    
            if(message === "LCD_OFF") {
                await Command.create({
                    "categoryName": "Backlight",
                    "commandName": "LCD_OFF",
                    "changedFrom": ws.id,
                    "userId": userIdFromDevice,
                    "deviceId": ws.id
                });
            }
    
            if(message === "WR_PUMP_ON") {
                await Command.create({
                    "categoryName": "Watering Routine Pump",
                    "changedFrom": ws.id,
                    "commandName": "WR_PUMP_ON",
                    "userId": userIdFromDevice,
                    "deviceId": ws.id
                });
            }
    
            if(message === "WR_PUMP_OFF") {
                await Command.create({
                    "categoryName": "Watering Routine Pump",
                    "changedFrom": ws.id,
                    "commandName": "WR_PUMP_OFF",
                    "userId": userIdFromDevice,
                    "deviceId": ws.id
                });
            }
    
            if(message === "WR_OFF") {
                await Command.create({
                    "categoryName": "Watering Routine Mode",
                    "changedFrom": ws.id,
                    "commandName": "WR_OFF",
                    "userId": userIdFromDevice,
                    "deviceId": ws.id
                });
            }
    
            if(message === "WR_ON") {
                await Command.create({
                    "categoryName": "Watering Routine Mode",
                    "changedFrom": ws.id,
                    "commandName": "WR_ON",
                    "userId": userIdFromDevice,
                    "deviceId": ws.id
                });
            }
        }
        lastCommand = message;
    });

    ws.on('close', () => {
        const findInLookup = _.find(lookup, (clientSerialConnected) => clientSerialConnected === ws.id);
        console.log(findInLookup);
        _.pull(lookup, findInLookup);
        console.log('Client disconnected');
        clearInterval(ws.timer);
        ws.terminate();
    });

    ws.timer = setInterval(function(){
        pingpong(ws);
    },30000);
});

function pingpong(ws) {
    console.log(ws.id+' send a ping');
    ws.send(`time#${moment().tz('America/Sao_Paulo').format('HH:mm')}`);
    ws.ping('coucou',{},true);
}

app.post('/send', async function (req, res) {
    const { userId, deviceId } = req.body;

    const user = await User.findOne({_id: userId});
    if(!user) 
        return res.send({error: true, message: "Usuário não encontrado"});

    // check if the deviceId requested to send command exists
    const device = await Device.findOne({_id: deviceId});
    if(!device) 
        return res.send({error: true, message: "Dispositivo não encontrado"});


    const userDevices = _.get(user, 'devices'); // array of ids assigned to that user
    
    // check if the device is under user's collection
    let isDeviceFromThisUser;
    if(userDevices.length > 0) {
        isDeviceFromThisUser = userDevices.indexOf(deviceId);
    }

    if(isDeviceFromThisUser === -1)
        return res.send({true: true, message: "Operação não autorizada"});

    // serial key from the localize the device in this context on ws clients
    const deviceSerialKey = _.get(device, 'deviceSerialKey');
    const command = await Command.create(req.body);

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            // send command only for the client requested
            if(deviceSerialKey === client.id) {
                client.send(req.body.commandName);
                if(req.body.commandName === "SETTINGS") {
                    client.send(req.body.value);
                }
            
                // WA until next local station version (beginPumpTimer missing in the hardware):
                if(req.body.commandName === "WR_PUMP_OFF") {
                    client.send("MP0");
                }

                if(req.body.commandName === "MP0") {
                    client.send("WR_PUMP_OFF");
                }
            }
        }
    });
    res.send(command);
});



app.post('/ls-status', async function(req, res) {
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
      }

    const isDeviceConnected = !!setFind(wss.clients, e => e.id === deviceSerialKey);

    res.send({isDeviceConnected});
});

const port = 8080;

server.listen(process.env.PORT || port, () => {
    console.log(`Server running in the port ${port}`);
});
