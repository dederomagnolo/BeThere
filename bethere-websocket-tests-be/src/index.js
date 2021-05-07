const express = require('express');
const bodyParser = require('body-parser');
const { Server } = require('ws');
const WebSocket = require('ws');
const uuid = require('uuid');
const moment = require('moment');
const _ = require('lodash');
const http = require('http');
const cors = require('cors');

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
})

require('./app/controllers/index')(app); //importa controllers

const server = http.createServer(app);

const wss = new Server({ server });

const lookup = {};
let index = 0;

wss.on('connection' , (ws, req) => {
    const receivedUrl = req.url;
    const receivedParamsFromDevice = receivedUrl.split('/?');
    const paramsSplitted = receivedParamsFromDevice[1].split('=');
    ws.isAlive = true;
    ws.send('Server touched!');
    ws.id = paramsSplitted[1]
    index++;
    lookup[index] = paramsSplitted[1]; // serialKey from device
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
            console.log(ws.id);
        }

        console.log(`Received message from ${ws.id}=> ${message}`);
        if(message === "MP0") {
            await Command.create({
                "commandName": "Pump Status",
                "value": "0",
                "changedFrom": ws.id,
            });
        }

        if(message === "LCD_OFF"){
            await Command.create({
                "commandName": "Backlight",
                "value": "LCD_OFF",
                "changedFrom": ws.id
            });
        }
    });
    ws.on('close', () => {
        console.log("on close");
        clearInterval(interval);
        console.log('Client disconnected');
        ws.terminate();
    });
});

const interval = setInterval(() => {
    wss.clients.forEach((client) => {
        console.log(client.id);
        client.send("beat");
    });
}, 30000);

/* const interval = setInterval(function ping() {
    wss.clients.forEach(ws => {
        console.log('this interval')
        console.log(ws.isAlive);
        if (ws.isAlive === false) return ws.terminate();
        ws.ping();
        ws.isAlive = false;
    });
}, 30000); */

/* wss.on('close', function close() {
    clearInterval(interval);
});
 */
app.post('/send', async function (req, res) {
    const command = await Command.create(req.body);
    const userId = req.body.userId;
    console.log(userId);
    if(userId === '5fc8527005fe91002450390e') {
        console.log("home");
        const isBeThereHome = _.filter(wss.clients, (client) => {
            const clientId = client.id;
            console.log("filter");
            console.log(client.id);
        });
        console.log(isBeThereHome);
    }
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(req.body.value);
        }
    })
    
    res.send(command);
});

const port = 8080;

server.listen(process.env.PORT || port, () => {
    console.log(`Server running in the port ${port}`);
});
