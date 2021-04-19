const express = require('express');
const bodyParser = require('body-parser');
const { Server } = require('ws');
const http = require('http');
const cors = require('cors');
const Command = require('./app/models/command');
const WebSocket = require('ws');
const Device = require('./app/models/device');
const Settings = require('./app/models/settings');
const uuid = require('uuid');
const moment = require('moment');

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

wss.on('connection' , ws => {
    ws.isAlive = true;
    ws.send('Server touched!');
    /* ws.id = uuid.v4(); */

    ws.on('message', async (message) => {
        let deviceSerialKey = message.substr(0,2);
        if (deviceSerialKey === "$S") {
            console.log("primeiro if");
            deviceSerialKey = message.substr(2,deviceSerialKey.lenght);
            const deviceFound = await Device.findOne({deviceSerialKey});
            if(deviceFound) {
                const deviceSettings = await Settings.findOne({_id: deviceFound.settings[0]});
                ws.send("authenticated!");
                ws.send("SETTINGS");
                ws.send(`${deviceSettings.backlight},${deviceSettings.pumpTimer},${deviceSettings.localMeasureInterval},${deviceSettings.remoteMeasureInterval}, 0`);
            } else {
                ws.send("not authenticated!");
                ws.close();                
                // need to add here the call for settings of authenticated device
                // need to send the variables as string in websocket message
            }
        }

        console.log(`Received message from ${ws.id}=> ${message}`);
        if(message === "MP0") {
            await Command.create({
                "commandName": "Pump Status",
                "value": "0",
                "changedFrom": "Client 1"
            });
        }

        if(message === "LCD_OFF"){
            await Command.create({
                "commandName": "Backlight",
                "value": "LCD_OFF",
                "changedFrom": "Client 1"
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

setInterval(() => {
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
}, 30000);

wss.on('close', function close() {
    clearInterval(interval);
}); */

app.post('/send', async function (req, res) {
    const command = await Command.create(req.body);
    console.log(req.body.value);
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
