#include "ThingSpeak.h"
#include <SPI.h>
#include <Ethernet.h>
#include "DHT.h" //DHT Library

byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED};
EthernetClient client;

//Atribuição dos pinos
#define sensor A0
#define bomba 1
#define ledVerde 4
#define ledAmarelo 5
#define ledVermelho 6
#define luz A1
#define autoButton 2
#define autoLed 3

//Configuração do DHT
#define pinDHT 7     //DHT communication pin
#define typeDHT DHT22 //DHT sensor type, in this case DHT22

DHT dht(pinDHT, typeDHT); //declaring an DHT object

//variáveis para gravação
int umidade;
int luminosidade;
String nivelUmidade;
int codSoil;

//variáveis do autoButton
volatile int funcaoa = 0; // valor instantaneo enviado pelo botão
volatile int funcaob = 0; // valor guardado
volatile int estado = 0; // guarda o valor 0 ou 1 do autoButton (HIGH ou LOW)

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

  //digitalWrite(bomba, HIGH);

  //auto mode setup
  pinMode(autoButton, INPUT);
  pinMode(autoLed, OUTPUT);
  
  attachInterrupt(0, autoSet, CHANGE);

  Serial.print("------------ BE THERE - ONLINE ------------");
}

void loop() {

  //#####LEITURAS####
  
  //leitura da umidade
  umidade = analogRead(sensor);

  //read humidity and temperature
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  //sensor DHT read failure check
  if (isnan(h) || isnan(t)) {
    Serial.print("\n");
    Serial.print("\nDHT failed! Check Connections!");
  }
  
  //classificação do solo
  if (umidade >= 200 && umidade <=500){
    
    codSoil = 1; //solo úmido

    //Acende led verde
    digitalWrite(ledVerde, HIGH);
    digitalWrite(ledVermelho, LOW);
    digitalWrite(ledAmarelo, LOW);
    digitalWrite(bomba, HIGH);
  } 
  
  else if (umidade > 500 && umidade < 850){

    codSoil = 2; //solo parcialmente umido

    //Acende led amarelo
    digitalWrite(ledVerde, LOW);
    digitalWrite(ledVermelho, LOW);
    digitalWrite(ledAmarelo, HIGH); 
    digitalWrite(bomba, HIGH);
  }
  
  else if(umidade >= 850 && umidade <= 1024)
  { 

    codSoil = 3; //solo seco

    //Acende led vermelho
    digitalWrite(ledVerde, LOW);
    digitalWrite(ledVermelho, HIGH);
    digitalWrite(ledAmarelo, LOW);
    
    if (bomba){
      digitalWrite(bomba, LOW);
    }
  }

  //ajustar limites para exibir o valor de 0 - 100 (seco-umido/sem luz-com luz)
  umidade = map(umidade, 0, 1024, 100, 0); 
  
  //leitura da ponta analógica do divisor de tensão com foto resistor
  luminosidade = analogRead(luz);
  luminosidade = map(luminosidade, 0, 1024, 0, 100);
  
  //plot no serial monitor
  Serial.print("\n------------ BE THERE - REPORT ------------");
  
  Serial.print("\n----- Soil Status ----- ");
  Serial.print("\nSoil Moisture: ");
  Serial.print(umidade);
  Serial.print("%");

  if (codSoil == 1){
    nivelUmidade = "\nMoist Soil";
  } else if (codSoil == 2){
      nivelUmidade = "\nPartially Moist Soil";
  } else{
      nivelUmidade = "\nDry Soil";  
  }
  Serial.print(nivelUmidade);
  Serial.print("\nLuminosity: ");
  Serial.print(luminosidade);
  Serial.print("%");
  Serial.print("\n");

  //DHT posts
  Serial.print("\n----- Weather Status -----");
  Serial.print("\nHumidity: ");
  Serial.print(h);
  Serial.print("%\n");
  Serial.print("Temperature: ");
  Serial.print(t);
  Serial.print("°C\n");
  Serial.print("\n");


    //set fields
    ThingSpeak.setField(1, umidade);
    ThingSpeak.setField(2, luminosidade);
    ThingSpeak.setField(3, h);
    ThingSpeak.setField(4, t);
    //write fields
    int x = ThingSpeak.writeFields(myChannelNumber,myWriteAPIKey);

    if (x == 200){
      Serial.print("\nOK!");
    } else{
        Serial.print("Error: " + String(x));
    }
  
  

  //delay de 20
  delay(20000); // ThingSpeak precisa de pelo menos 15s de intervalo

}

void autoSet(){
   
   Serial.println("\nAuto Set Changed");
   funcaoa=digitalRead(autoButton); // ler o valor enviado pelo botão: "HIGH" ou "LOW"
   if ((funcaoa == HIGH) && (funcaob == LOW)) {
   estado = 1 - estado;
   delay(500); // Tempo apertando o botão, se fica pouco de mais a o led fica piscando rapidamente, não é aconselhavel deixar menos que 500
   }
   funcaob=funcaoa;

   if (estado == 1) {
   digitalWrite(autoLed, HIGH); // liga o led
   } else {
   digitalWrite(autoLed, LOW); // desliga o led;
   }

   delay(500);
}
