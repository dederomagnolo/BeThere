const express = require('express');
const bodyParser = require('body-parser');
const { Server } = require('ws');
const WebSocket = require('ws');
const uuid = require('uuid');
const moment = require('moment');
const _ = require('lodash');
const http = require('http');
const cors = require('cors');
const tz = require('moment-timezone');

const Command = require('./app/models/command');
const Device = require('./app/models/device');
const Settings = require('./app/models/settings');
const {minutesToMilliseconds, secondsToMilliseconds} = require('./utils');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(cors());

app.get('/', (req, res) => {
    res.send("BeThere WebSocket - Home");
});

require('./app/controllers/index')(app); //importa controllers

const server = http.createServer(app);

const wss = new Server({ server });

const lookup = {};
let index = 0;

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
    // change ws id to serial key if it exists
    if(paramsSplitted.length > 0) {
        ws.id = paramsSplitted[1];
    }
    // add device to list of connected devices
    index++;
    lookup[index] = paramsSplitted[1]; // serialKey from device

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
        if(message === "MP0") {
            await Command.create({
                "categoryName": "Manual Pump",
                "commandName": "MP0",
                "changedFrom": ws.id,
            });
        }

        if(message === "LCD_OFF") {
            await Command.create({
                "categoryName": "Backlight",
                "commandName": "LCD_OFF",
                "changedFrom": ws.id
            });
        }

        if(message === "WR_PUMP_ON") {
            await Command.create({
                "categoryName": "Watering Routine",
                "changedFrom": ws.id,
                "commandName": "WR_PUMP_ON"
            });
        }
    });

    ws.on('close', () => {
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
    const command = await Command.create(req.body);
    /* const userId = req.body.userId;
    console.log(userId);
    if(userId === '5fc8527005fe91002450390e') {
        console.log("home");
        const isBeThereHome = _.filter(wss.clients, (client) => {
            const clientId = client.id;
            console.log("filter");
            console.log(client.id);
        });
        console.log(isBeThereHome);
    } */
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(req.body.commandName);
            if(req.body.commandName === "SETTINGS") {
                client.send(req.body.value);
            }
        }
    });
    res.send(command);
});

const port = 8080;

server.listen(process.env.PORT || port, () => {
    console.log(`Server running in the port ${port}`);
});
