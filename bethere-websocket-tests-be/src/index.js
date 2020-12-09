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
    ws.isAlive = true;
    ws.send('I touched the server!');
    
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
    ws.on('close', () => {
        clearInterval(interval);
        console.log('Client disconnected');
    });
});

const interval = setInterval(function ping() {
    wss.clients.forEach(ws => {
      if (ws.isAlive === false) return ws.terminate();
  
      ws.isAlive = false;
      /* ws.ping(); */
    });
}, 30000);

wss.on('close', function close() {
    clearInterval(interval);
});

setInterval(() => {
    wss.clients.forEach((client) => {
      client.send("beat");
    });
}, 40000);

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
