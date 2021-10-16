#include "FastLED.h"

#define NUM_LEDS 50
CRGB leds[NUM_LEDS];
int counter = 0;
int value = 0;
int dx = 1;

void setup() { 
  FastLED.addLeds<NEOPIXEL, 2>(leds, NUM_LEDS);
}

int cycle(int &v, int max_v, int min_v){
  if(v > max_v){
    v = min_v;
  }else if(v < min_v){
    v = max_v;
  }else{
    v += 1;
  }
  return v;
}

void loop() {
  leds[3] = CHSV( cycle(value, 255, 0), 255, 255); FastLED.show();
  leds[4] = CHSV( cycle(value, 255, 0), 255, 255); FastLED.show();
  leds[5] = CHSV( cycle(value, 255, 0), 255, 255); FastLED.show();
  if(counter < NUM_LEDS && counter >= 0){
    leds[counter] = CHSV( cycle(value, 255, 0), 255, 255); FastLED.show(); delay(200);
    leds[counter] = CHSV(0, 0, 0); FastLED.show(); delay(33);
  }else{
    dx*=-1;
    counter+=dx;
  }
  counter+=dx;
}
