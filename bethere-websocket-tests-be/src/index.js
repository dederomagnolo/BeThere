const express = require('express');
const bodyParser = require('body-parser');
const WebSocketServer = require('websocket').server;
const app = express();

const http = require('http');
const path = require("path");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const server = http.createServer(app);

const port = 8080;

app.get('/', (req, res) => {
    res.send("Olar");
})

server.listen(port, () => {
    console.log(`Server está executando na porta ${port}`);
});



wsServer = new WebSocketServer({
    httpServer: server
  });

wsServer.on('request', (request) => {
    //Estado do relé: false para desligado e true para ligado
    let state = false;

    //Aceita a conexão do client
    let client = request.accept(null, request.origin);

    //Chamado quando o client envia uma mensagem
    client.on('message', (message) => {
        //Se é uma mensagem string utf8
        if (message.type === 'utf8') {
            console.log(message.utf8Data);
        }
    });
        //Cria uma função que será executada a cada 1 segundo para enviar o estado do relé
    let interval = setInterval(() => {
        //Envia para o client a mensagem dependendo do estado atual da variável state
        client.sendUTF(state ? "ON" : "OFF");
        state = !state;
    }, 1000);//Tempo 1 seg

        //Chamado quando a conexão com o client é fechada
    client.on('close', () => {
        console.log("Conexão fechada");
        //Remove o intervalo de envio de estado
        clearInterval(interval);
    });
});



