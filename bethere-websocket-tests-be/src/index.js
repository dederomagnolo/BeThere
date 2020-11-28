const express = require('express');
const bodyParser = require('body-parser');
const { Server } = require('ws');
const http = require('http');
const cors = require('cors');
const Command = require('./app/models/command');
const WebSocket = require('ws');


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
    let lastStatus;
    ws.on('message', async (message) => {
        console.log(`Received message => ${message}`);
        if(message === "R0") {
            await Command.create({
                "commandName": "Pump Status",
                "value": "0",
                "changedFrom": "Client 1"
            });
        } 
    });
    ws.on('close', () => console.log('Client disconnected'));
    ws.send('I touched the server!');
});

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

setInterval(() => {
    wss.clients.forEach((client) => {
      client.send("beat");
    });
  }, 10000);

const port = 8080;

server.listen(process.env.PORT || port, () => {
    console.log(`Server running in the port ${port}`);
});
