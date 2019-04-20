#include "ThingSpeak.h"
#include <SPI.h>
#include <Ethernet.h>
#include "DHT.h" //DHT Library

byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED};
EthernetClient client;

//Atribuição dos pinos
#define sensor A0
#define bomba 3
#define ledVerde 8
#define ledAmarelo 9
#define ledVermelho 10
#define luz A1

//Configuração do DHT
#define pinDHT 2     //DHT communication pin
#define typeDHT DHT22 //DHT sensor type, in this case DHT22

DHT dht(pinDHT, typeDHT); //declaring an DHT object

//variáveis para gravação
int umidade;
int luminosidade;
String nivelUmidade;

//Campos do ThingSpeak
unsigned long myChannelNumber = 695672;
const char * myWriteAPIKey = "ZY113X3ZSZG96YC8";

void setup() {
  
  Serial.begin(9600);
  dht.begin(); //initialize DHT object
  Ethernet.begin(mac);
  ThingSpeak.begin(client);
  
  //Entradas e saída
  pinMode(sensor, INPUT); //sensor de umidade
  pinMode(luz, INPUT); //sensor de luminosidade (conectada ao divisor de tensão com fotoresistor)
  pinMode(bomba, OUTPUT); //acionamento do relé

  //Leds indicadores
  pinMode(ledVerde, OUTPUT);
  pinMode(ledAmarelo, OUTPUT);
  pinMode(ledVermelho, OUTPUT);

  digitalWrite(bomba, HIGH);
}

void loop() {

  //leitura da umidade
  umidade = analogRead(sensor);

  //read humidity and temperature
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  //sensor DHT read failure check
  if (isnan(h) || isnan(t)) {
    Serial.print("DHT failed");
  }
  
  //classificação do solo
  if (umidade >= 200 && umidade <=500){
    
    nivelUmidade = "Úmido";

    //Acende led verde
    digitalWrite(ledVerde, HIGH);
    digitalWrite(ledVermelho, LOW);
    digitalWrite(ledAmarelo, LOW);
    digitalWrite(bomba, HIGH);
  } 
  
  else if (umidade > 500 && umidade < 850){
    
    nivelUmidade = "Quase Seco";

    //Acende led amarelo
    digitalWrite(ledVerde, LOW);
    digitalWrite(ledVermelho, LOW);
    digitalWrite(ledAmarelo, HIGH); 
    digitalWrite(bomba, HIGH);
  }
  
  else if(umidade >= 850 && umidade <= 1024)
  { 
    
    nivelUmidade = "Seco";

    //Acende led vermelho
    digitalWrite(ledVerde, LOW);
    digitalWrite(ledVermelho, HIGH);
    digitalWrite(ledAmarelo, LOW);
    digitalWrite(bomba, LOW);
  }

  //ajustar limites para exibir o valor de 0 - 100 (seco-umido/sem luz-com luz)
  umidade = map(umidade, 0, 1024, 100, 0); 
  
  //leitura da ponta analógica do divisor de tensão com foto resistor
  luminosidade = analogRead(luz);
  luminosidade = map(luminosidade, 0, 1024, 0, 100);

  //plot no serial monitor
  Serial.print("\nUmidade do solo: ");
  Serial.print(umidade);
  Serial.print("%");
  Serial.print("\nLuminosidade: ");
  Serial.print(luminosidade);
  Serial.print("%");
  Serial.print("\n");
  Serial.print(nivelUmidade);

  //DHT posts
  Serial.print("\nHumidity: ");
  Serial.print(h);
  Serial.print("%\n");
  Serial.print("Temperature: ");
  Serial.print(t);
  Serial.print("°C\n");

  //escrever no field 1 - ThingSpeak
  ThingSpeak.writeField(myChannelNumber, 1, umidade, myWriteAPIKey);
  
  //delay de 20
  delay(2000); // ThingSpeak precisa de pelo menos 15s de intervalo

}
