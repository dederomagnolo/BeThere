#include "ThingSpeak.h"
#include <SPI.h>
#include <Ethernet.h>
#include "DHT.h" //DHT Library
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

byte mac[] = {0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED};
EthernetClient client; //ethernet client object

//Atribuição dos pinos
#define sensor A0
#define bomba 9
#define ledVerde 8
#define ledAmarelo 5
#define ledVermelho 6
#define resetPin 12 
#define ledAzul 14

#define luz A1
//#define autoButton 2
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
long stopRead = 0;
long startPump = 0;

// Inicializa o display no endereço 0x27
LiquidCrystal_I2C lcd(0x27, 2, 1, 0, 4, 5, 6, 7, 3, POSITIVE);


//Campos do ThingSpeak
unsigned long myChannelNumber = 695672;
const char * myWriteAPIKey = "ZY113X3ZSZG96YC8";

void setup() {
  
  Serial.begin(9600);
  dht.begin(); //initialize DHT object
  
  Ethernet.begin(mac);
  ThingSpeak.begin(client);

  digitalWrite(resetPin, LOW);
  
  //Entradas e saída
  pinMode(sensor, INPUT); //sensor de umidade
  pinMode(luz, INPUT); //sensor de luminosidade (conectada ao divisor de tensão com fotoresistor)
  pinMode(bomba, OUTPUT); //acionamento do relé

  digitalWrite(bomba, HIGH); //inicializar desligado
  
  //Leds indicadores
  pinMode(ledVerde, OUTPUT);
  pinMode(ledAmarelo, OUTPUT);
  pinMode(ledVermelho, OUTPUT);
  pinMode(ledAzul, OUTPUT);

  //Reset Button
  pinMode(resetPin, OUTPUT);
  
  //Estado inicial do relé
  digitalWrite(bomba, HIGH);

  
  
  //indicadores visuais de inicialização
  digitalWrite(ledVerde, HIGH);
  delay(500);
  digitalWrite(ledVerde, LOW);
  digitalWrite(ledAmarelo, HIGH);
  delay(500);
  digitalWrite(ledAmarelo, LOW);
  digitalWrite(ledVermelho, HIGH);
  delay(500);
  digitalWrite(ledAzul, HIGH);
  digitalWrite(ledVermelho, LOW);
  delay(500);
  digitalWrite(ledVerde, HIGH);
  delay(500);
  digitalWrite(ledAmarelo, HIGH);
  delay(500);
  digitalWrite(ledVermelho, HIGH);
  digitalWrite(ledAzul, LOW);
  delay(200);

  Serial.print("------------ BE THERE - ONLINE ------------");
}

void loop() {
  
  //#####LEITURAS####

  if(millis()-stopRead > 20000){
      //leitura da umidade
    umidade = analogRead(sensor);

    int bombaFlag = ThingSpeak.readFloatField(myChannelNumber, 5);
    
    Serial.print("\nPUMP: ");
    Serial.print(bombaFlag);
      
    if(bombaFlag == 1){
      Serial.print("\nThe pump is turned on by web app!\n");

      startPump = millis();
      
      while(millis()<startPump+20000){
        digitalWrite(bomba, LOW);  
      }
      
      bombaFlag = 0;
      digitalWrite(bomba, LOW);
      Serial.print("\nFinished watering your plants!\n");
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
      //digitalWrite(bomba, HIGH);
    }
    
    else if(umidade > 850 && umidade <= 1024)
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
    luminosidade = 100*((analogRead(luz))/1023);

    
    //plot no serial monitor
    Serial.print("\n------------ BE THERE - REPORT ------------");
    
    Serial.print("\n----- Soil Status ----- ");
    Serial.print("\nSoil Moisture: ");
    Serial.print(umidade);
    Serial.print("%");
    
    
    if (codSoil == 1){
      nivelUmidade = "\nMoist";
    } else if (codSoil == 2){
        nivelUmidade = "\nPartially Moist";
    } else{
        nivelUmidade = "\nDry";  
    }

    //lcd.clear();
    //lcd.setCursor(0,0);
    //lcd.print("Soil:");
    //lcd.setCursor(5,0);
    //lcd.print(nivelUmidade);
    
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
    //ThingSpeak.setField(5, bombaFlag);
    
    //write fields
    int x = ThingSpeak.writeFields(myChannelNumber,myWriteAPIKey);
  
    if (x == 200){
      Serial.print("\nOK!");
    } else{
        Serial.print("Error: " + String(x));
    }

    stopRead = millis();
  }

  //digitalWrite(resetPin, LOW);
  //delay de 20
  //delay(20000); // ThingSpeak precisa de pelo menos 15s de interval
  
}
