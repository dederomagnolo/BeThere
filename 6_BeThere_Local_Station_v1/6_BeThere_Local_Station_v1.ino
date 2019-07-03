#include "ThingSpeak.h"
#include <SPI.h>
#include <Ethernet.h>
#include "DHT.h" //DHT Library
#include <Wire.h>

byte mac[] = {0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED};
EthernetClient client; //ethernet client object
// Inicializa o display no endereço 0x27

//Atribuição dos pinos
#define sensor A0
#define luz A1
#define ledAmarelo 5
#define ledVermelho 6
#define ledVerde 8
#define bomba 2
#define resetPin 12 
#define ledAzul 14
#define timerLed 16
//Configuração do DHT
#define pinDHT 7     //DHT communication pin
#define typeDHT DHT22 //DHT sensor type, in this case DHT22

//#define autoButton 2
#define autoLed 3

DHT dht(pinDHT, typeDHT); //declaring an DHT object

//variáveis para gravação
int umidade;
int luminosidade;
int luminosidade2;
String nivelUmidade;
String nivelLuz;
int codSoil;
long stopRead = 0;
long startPump = 0;
unsigned long startTimer = 0UL;

//flags
int bombaFlag = 0;
int luzFlag;
long int updateTime = 0;
long int recordedTime = 0;
long timerFlag = 0;
int timeSet = 0;
unsigned long totalTempo = 0UL;

//Campos do ThingSpeak
unsigned long mainChannelNumber = 695672;
const char * myWriteAPIKey = "ZY113X3ZSZG96YC8";

void setup() {

  Serial.begin(9600);
  dht.begin(); //initialize DHT object
  Ethernet.begin(mac);
  ThingSpeak.begin(client);
  
  //Entradas e saídas

  //portas analógicas e relé
  pinMode(sensor, INPUT); //sensor de umidade
  pinMode(luz, INPUT); //porta conectada ao divisor de tensão com fotoresistor)
  pinMode(bomba, OUTPUT); //acionamento do relé
  //Leds indicadores
  pinMode(ledVerde, OUTPUT);
  pinMode(ledAmarelo, OUTPUT);
  pinMode(ledVermelho, OUTPUT);
  pinMode(ledAzul, OUTPUT); //para indicar bomba ligada
  pinMode(timerLed, OUTPUT);

  //Reset Button
  pinMode(resetPin, OUTPUT);

  //Estados iniciais
  digitalWrite(bomba, HIGH); //bomba desligada
  //digitalWrite(resetPin, LOW);
  digitalWrite(timerLed, LOW);
 
  Serial.print("------------ BE THERE - ONLINE ------------\n");
}

void loop() {

  if(timerFlag == 1){
    
    if(totalTempo > recordedTime){
        startPump = millis();
        Serial.print("\nTimer mode: pump on");
        
        while(millis()<startPump+20000){
            digitalWrite(bomba, LOW);
            digitalWrite(ledAzul, HIGH);
        }
        digitalWrite(bomba, HIGH);
        digitalWrite(ledAzul, LOW);
        Serial.print("\nYour garden has been watered!\n");
        startTimer = millis();
    }
  }

  if(millis()-stopRead > 20000){

    totalTempo = millis()-startTimer;
    
    timeSet = ThingSpeak.readFloatField(mainChannelNumber, 6);

    Serial.print("\ntimeset:");
    Serial.print(timeSet);

    switch (timeSet) {
    case 0:
      updateTime = 0;
      break;
    case 1:
      updateTime = 300000;
      break;
    case 2:
      updateTime = 28800000;
      break;
    }
    
    if(updateTime != recordedTime){ //verifica se ocorreu mudança no status do Timer

      recordedTime = updateTime; //grava o novo time setado
      
      if(recordedTime != 0){
        timerFlag = 1; //timer ligado
        digitalWrite(timerLed, HIGH);
        startTimer = millis(); //timer começa contar
      } else{
          timerFlag = 0; //timer desligado
          digitalWrite(timerLed, LOW);
        }   
    } //se nao ocorre mudança, o tempo gravado é mantido

    Serial.print("\ntempo gravado:");
    Serial.print(recordedTime);
    
    //leitura da umidade
    umidade = analogRead(sensor);
    //leitura da ponta analógica do divisor de tensão com foto resistor
    luminosidade = analogRead(luz);

    //check do status da bomba no ThingSpeak
    bombaFlag = ThingSpeak.readFloatField(mainChannelNumber, 5);

    //conferencia da luminosidade - atribuição de status
    if(luminosidade > 530){
      luzFlag = 0; //sem luz
    }
    else if (luminosidade <= 300){
      luzFlag = 1; //com luz incidente
    }
    else if (luminosidade > 300 && luminosidade <= 530){
      luzFlag = 2; //luz moderada
    }

    //linha de teste
    Serial.print("\nPUMP: ");
    Serial.print(bombaFlag);

    //bomba foi ligada via web
    if(bombaFlag == 1){
      Serial.print("\nThe pump is turned on by web app!\n");

      startPump = millis();
      
      while(millis()<startPump+20000){
        digitalWrite(bomba, LOW);
        digitalWrite(ledAzul, HIGH);  
      }
      
      bombaFlag = 0;
      digitalWrite(ledAzul, LOW);
      Serial.print("\nFinished watering your garden!\n");
    }
    
    //read humidity and temperature
    float h = dht.readHumidity();
    float t = dht.readTemperature();
  
    //sensor DHT read failure check
    if (isnan(h) || isnan(t)) {
      Serial.print("\n");
      Serial.print("\nDHT failed! Check Connections!");
    }
    
    //classificação do solo
    if (umidade <= 500){
      
      codSoil = 1; //solo úmido
  
      //Acende led verde
      digitalWrite(ledVerde, HIGH);
      digitalWrite(ledVermelho, LOW);
      digitalWrite(ledAmarelo, LOW);
      digitalWrite(ledAzul, LOW);
      
      if (timerFlag == 0){
        digitalWrite(bomba, HIGH); //desliga bomba
      }
    }
    
    else if (umidade > 500 && umidade < 750){
  
      codSoil = 2; //solo parcialmente umido
  
      //Acende led amarelo
      digitalWrite(ledVerde, LOW);
      digitalWrite(ledVermelho, LOW);
      digitalWrite(ledAmarelo, HIGH); 
      digitalWrite(ledAzul, LOW);

      if (timerFlag == 0){
        digitalWrite(bomba, HIGH); //desliga bomba
      }
    }
    
    else if(umidade > 750)
    { 
      codSoil = 3; //solo seco
  
      //Acende led vermelho
      digitalWrite(ledVerde, LOW);
      digitalWrite(ledVermelho, HIGH);
      digitalWrite(ledAmarelo, LOW);
      
      if (timerFlag == 0){
        digitalWrite(bomba, LOW); //liga bomba
        digitalWrite(ledAzul, HIGH); 
      }  
    }
  
    //ajustar limites para exibir o valor de 0 - 100 (seco-umido/sem luz-com luz)
    umidade = map(umidade, 0, 1023, 100, 0); 

    //imprimir na serial as leituras
    Serial.print("\n------------ BE THERE - REPORT ------------");

    if(timerFlag == 0){
      Serial.print("\nTimer mode Off");
    } else {
      Serial.print("\nIrrigation Interval:");
      Serial.print((recordedTime/60000) + "hours");  
    }
    
    Serial.print("\n----- Soil Status ----- ");
    Serial.print("\nSoil Moisture: ");
    Serial.print(umidade);
    Serial.print("%");

    //status do solo
    if (codSoil == 1){
      nivelUmidade = "moist";
    } else if (codSoil == 2){
        nivelUmidade = "partially Moist";
    } else{
        nivelUmidade = "dry";  
    }

    if (luzFlag == 1){
      nivelLuz = "incident light";
    } else if (luzFlag == 2){
      nivelLuz = "partial light";
    } else {
      nivelLuz = "no light";
    }

    luminosidade2 = map(luminosidade, 0, 1023, 100, 0); 
    
    Serial.println("\nLuminosity: ");
    Serial.println(luminosidade2);
    Serial.println("Your soil is " + nivelUmidade + " and your garden has " + nivelLuz);
  
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
    ThingSpeak.setField(5, bombaFlag);
    
    //write fields
    int x = ThingSpeak.writeFields(mainChannelNumber,myWriteAPIKey);
  
    if (x == 200){
      Serial.print("Data sent with success!");
    } else{
        Serial.print("Coneection Error: " + String(x));
        Serial.print("\n");
    }

    stopRead = millis();
  }

  //digitalWrite(resetPin, LOW);
  //delay de 20
  //delay(20000); // ThingSpeak precisa de pelo menos 15s de interval
  
}
