#include <ArduinoWebsockets.h>
#include "ESP8266WiFi.h"

#define led 23

char ssid[] = "Satan`s Connection";
char password[] = "tininha157";
//const char* websockets_server_host = "192.168.0.34"; // IP do servidor websocket
const char* websockets_server_host = "https://bethere-be.herokuapp.com/"; // IP do servidor websocket
const int websockets_server_port = 8080; // Porta de conexão do servidor
using namespace websockets;

// Objeto websocket client
WebsocketsClient wsclient;

void setup() 
{
    Serial.begin(19200);
    pinMode(led, OUTPUT);
    
    WiFi.begin(ssid, password);

    while(WiFi.status() != WL_CONNECTED)
    {
        Serial.print(".");
        delay(1000);
    }

    Serial.println("Connected to Wifi, Connecting to server.");

    // try to connect to web socket server
    bool connected = wsclient.connect(websockets_server_host);

    if(connected) {
        Serial.println("Connected!");
        wsclient.send("Olar");
    } else {
        Serial.println("Not Connected!");
        return;
    }
    
    // callback where the messages are received
    wsclient.onMessage([&](WebsocketsMessage message){        
        Serial.print("Got Message: ");
        Serial.println(message.data());

        // read the message and change state
        if(message.data().equalsIgnoreCase("ON"))
            digitalWrite(led, HIGH);
        else
        if(message.data().equalsIgnoreCase("OFF"))
            digitalWrite(led, LOW);
    });
}

void loop() 
{
    //  listen to websocket for new messages
    if(wsclient.available())
        wsclient.send("testando!"); 
        wsclient.poll();
    delay(300);
}
