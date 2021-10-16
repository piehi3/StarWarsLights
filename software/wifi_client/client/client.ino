#define DEBUG 0
#define USE_SERIAL Serial
#define NUM_LEDS 50
#define ID 1

#include <Arduino.h>

#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>

#include <ArduinoJson.h>

#include <WebSocketsClient.h>
#include <SocketIOclient.h>

#include <Hash.h>

const char* ssid = "2BrokeGirls";
const char* password = "Lightningy25711!";
const char* server = "192.168.0.100";
int port = 3000;
bool initalized = false;

ESP8266WiFiMulti WiFiMulti;
SocketIOclient socketIO;

#include <FastLED.h>
CRGBArray<NUM_LEDS> leds;
bool colorChanged = true;

//Red; Green; Blue;
int color[3] = {0,0,0};
int activeRange[2] = {0,NUM_LEDS-1};

void socketIOCustomEvent(uint8_t *payload, size_t length){
  const size_t capacity = sizeof(char)*length;
  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, payload);

  // Test if parsing succeeds.
  if (error) {
    #ifdef DEBUG
    Serial.print(F("deserializeJson() failed: "));
    Serial.println(error.f_str());
    #endif
    return;
  }

  if(doc[0] == "message"){
    float s = doc[1]["brighness"];
    
    int r = doc[1]["red"];
    int b = doc[1]["green"];
    int c = doc[1]["blue"];
    color[0] = int( s*r);
    color[1] = int( s*b);
    color[2] = int( s*c);
    USE_SERIAL.println(color[0]);
    activeRange[0] = doc[1]["start_pos"];
    activeRange[1] = doc[1]["stop_pos"];
    colorChanged = true;
  }else if(doc[0] == "current"){
    initalized = true;
  }
}


void socketIOEvent(socketIOmessageType_t type, uint8_t * payload, size_t length) {
    switch(type) {
        case sIOtype_DISCONNECT:
            #ifdef DEBUG
            //USE_SERIAL.printf("[IOc] Disconnected!\n");
            #endif
            if(initalized){
              initalized = false;
            }
            break;
        case sIOtype_CONNECT:
            #ifdef DEBUG
            USE_SERIAL.printf("[IOc] Connected to url: %s\n", payload);
            #endif
            break;
        case sIOtype_EVENT:
            #ifdef DEBUG
            USE_SERIAL.printf("[IOc] get event: %s\n", payload);
            #endif
            socketIOCustomEvent(payload, length);
            break;
        case sIOtype_ACK:
            #ifdef DEBUG
            USE_SERIAL.printf("[IOc] get ack: %u\n", length);
            #endif
            hexdump(payload, length);
            break;
        case sIOtype_ERROR:
            #ifdef DEBUG
            USE_SERIAL.printf("[IOc] get error: %u\n", length);
            #endif
            hexdump(payload, length);
            break;
        case sIOtype_BINARY_EVENT:
            #ifdef DEBUG
            USE_SERIAL.printf("[IOc] get binary: %u\n", length);
            #endif
            hexdump(payload, length);
            break;
        case sIOtype_BINARY_ACK:
            #ifdef DEBUG
            USE_SERIAL.printf("[IOc] get binary ack: %u\n", length);
            #endif
            hexdump(payload, length);
            break;
    }
}

void setup() {
    USE_SERIAL.begin(115200);

    FastLED.addLeds<NEOPIXEL,2>(leds, NUM_LEDS);
    //Serial.setDebugOutput(true);
    //USE_SERIAL.setDebugOutput(true);

    USE_SERIAL.println();
    USE_SERIAL.println();
    USE_SERIAL.println();

      for(uint8_t t = 4; t > 0; t--) {
          #ifdef DEBUG
          USE_SERIAL.printf("[SETUP] BOOT WAIT %d...\n", t);
          USE_SERIAL.flush();
          #endif
          delay(1000);
      }

    // disable AP
    if(WiFi.getMode() & WIFI_AP) {
        WiFi.softAPdisconnect(true);
    }

    WiFiMulti.addAP(ssid, password);

    //WiFi.disconnect();
    while(WiFiMulti.run() != WL_CONNECTED) {
        delay(100);
    }

    String ip = WiFi.localIP().toString();
    USE_SERIAL.printf("[SETUP] WiFi Connected %s\n", ip.c_str());

    // server address, port and URL
    socketIO.begin(server, port);

    // event handler
    socketIO.onEvent(socketIOEvent);
}

unsigned long messageTimestamp = 0;

void loop() {
    socketIO.loop();

    if(colorChanged){
      leds(activeRange[0], activeRange[1]) = CRGB( color[1], color[0], color[2] );
      FastLED.delay(33);
      colorChanged = false;
    }


    if(not initalized) {
        StaticJsonDocument<100> doc;
        JsonArray array = doc.to<JsonArray>();
        array.add("message");
        JsonObject param1 = array.createNestedObject();
        param1["ESP8266LEDServer"] = ID;
        String output;
        serializeJson(doc, output);        
        socketIO.sendEVENT(output);
    }
}
