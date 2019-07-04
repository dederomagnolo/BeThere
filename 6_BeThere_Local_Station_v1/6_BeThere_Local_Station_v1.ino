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
#define ledVermelho 9
#define ledAmarelo 8
#define ledVerde 7
#define ledAzul 6
#define bomba 5

//Configuração do DHT
#define pinDHT 4     //DHT communication pin
#define typeDHT DHT22 //DHT sensor type, in this case DHT22

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
//int bombaFlag = 0;
int luzFlag;
long int updateTime = 0;
long int recordedTime = 0;
long timerFlag = 0; //flag p/ indicar se o timer está ligado ou desligado
int timeSet = 0; //armazena o tempo do timer lido no ThingSpeak
int tempSet; //valor de temperatura configurado pelo usuario como maximo
int addTime = 0; //tempo de acrescimo da bomba caso a temperatura seja maior que maxTemp e umidade baixa
unsigned long totalTempo = 0UL;
int pumpTime = 0;
int deltaTemp = 0;

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

  //Estados iniciais
  digitalWrite(bomba, HIGH); //bomba desligada
  //digitalWrite(resetPin, LOW);
 
  Serial.print("------------ BE THERE - ONLINE ------------\n");
}

void loop() {

  if(timerFlag == 1){
    
    if(totalTempo > recordedTime){
        startPump = millis();
        Serial.print("\nTimer mode: pump on");

        pumpTime = 20000 + addTime; //tempo padrao da bomba ligada + addTime
        
        while(millis()<startPump+pumpTime){
            digitalWrite(bomba, LOW);
            digitalWrite(ledAzul, HIGH);
        }
        digitalWrite(bomba, HIGH);
        digitalWrite(ledAzul, LOW);
        Serial.print("\nYour garden has been watered!\n");
        startTimer = millis();
        addTime = 0;
    }
  }

  if(millis()-stopRead > 35000){

    totalTempo = millis()-startTimer; //calcula quantidade de tempo desde o início do timer
    
    timeSet = ThingSpeak.readFloatField(mainChannelNumber, 6); //ler timeSet: indica se o timer foi ligado

    //recebe o timeSet do ThingSpeak e verifica sr o timer está ligado.
    //nesta seção, no funcionamento ideal seria necessário programar as rotinas para 6h, 8h, etc.
    //nesta versão o timer ligado seta o tempo do timer para acionar a bomba a cada 2 minutos.
    switch (timeSet) {
    case 0:
      updateTime = 0; //timer desligado
      break;
    case 1:
      updateTime = 120000; //ligar por 2 min
      break;
    }
    
    if(updateTime != recordedTime){ //verifica se ocorreu mudança no status do Timer

      recordedTime = updateTime; //grava o novo time setado
      
      if(recordedTime != 0){
        timerFlag = 1; //timer ligado
        startTimer = millis(); //timer começa contar
        Serial.print("\n:");
        Serial.println(recordedTime);
      } else{
          timerFlag = 0; //timer desligado
        }   
    } //se nao ocorre mudança, o tempo gravado é mantido

    
    //leitura da umidade
    umidade = analogRead(sensor);
    //leitura da ponta analógica do divisor de tensão com foto resistor
    luminosidade = analogRead(luz);

    //check do status da bomba no ThingSpeak
    //bombaFlag = ThingSpeak.readFloatField(mainChannelNumber, 5);

    //conferencia da luminosidade - atribuição de status
    if(luminosidade >= 891){
      luzFlag = 0; //sem luz
      digitalWrite(ledAmarelo, LOW);
    }
    else {
      luzFlag = 1; //com luz
      digitalWrite(ledAmarelo, HIGH);
    }
 
    //read humidity and temperature
    float h = dht.readHumidity();
    float t = dht.readTemperature();
  
    //sensor DHT read failure check
    if (isnan(h) || isnan(t)) {
      Serial.print("\n");
      Serial.print("\nDHT failed! Check Connections!");
    } else {
      if(timerFlag == 1){ //verifica modo timer
        tempSet = ThingSpeak.readFloatField(mainChannelNumber, 5); //ler temperatura maxima configurada pelo usuário
      }
      if(t > tempSet && h < 30.00){ //verifica se a temperatura lida é maior que a temperatura configurada pelo usuário via web

          deltaTemp = t-tempSet;
          if(deltaTemp > 5 && deltaTemp < 10){
            addTime = 15000; //vai somar 15 s no tempo padrao da bomba
          } else if (deltaTemp > 10 && deltaTemp < 20){
            addTime = 25000; //vai somar 25 s no tempo padrao da bomba
            } else if(deltaTemp > 20){
              addTime = 30000; //vai somar 30s no tempo padrao da bomba
              }
        }
    }

    //classificação do solo
    if (umidade <= 500){
      
      codSoil = 1; //solo úmido
  
      //Acende led verde
      digitalWrite(ledVerde, HIGH);
      digitalWrite(ledVermelho, LOW);
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
      
      if (timerFlag == 0 && luzFlag == 1){
        digitalWrite(bomba, LOW); //liga bomba
        digitalWrite(ledAzul, HIGH); 
      }  
    }

    if(codSoil == 3 && luzFlag == 0 && timerFlag == 0){
        digitalWrite(bomba, HIGH); //desliga bomba
        digitalWrite(ledAzul, LOW); //apaga led bomba
      }
      
    //ajustar limites para exibir o valor de 0 - 100 (seco-umido/sem luz-com luz)
    umidade = map(umidade, 0, 1023, 100, 0); 

    //imprimir na serial as leituras
    Serial.print("\n------------ BE THERE - REPORT ------------");

    if(timerFlag == 0){
      Serial.print("\nTimer Mode Off!");
      Serial.print("\nUmidity Mode On!");
    } else {
      Serial.print("\nTimer Mode On!");
      Serial.print("\nUmidity Mode Off!");
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
    } else {
      nivelLuz = "no light";
    }

    luminosidade2 = map(luminosidade, 1023, 0, 0, 100); 
    
    Serial.print("\nLuminosity: ");
    Serial.print(luminosidade2);
    Serial.println("%");
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

  
}
