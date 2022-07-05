#ifndef BETHERE_H
#define BETHERE_H

#include <Arduino.h>

enum SERIAL_KEY_PROD_SHORT { 
    D_35U2I,
    D_M5YZ5 
};

class BeThere {
	public:
        String getAccessPointPage();
        String getServerUri(bool devMode, bool prodTest);
        bool getDevMode();
        String getSerialKey(enum SERIAL_KEY_PROD_SHORT shortDeviceId);
        char * getConfig(enum SERIAL_KEY_PROD_SHORT shortDeviceId);
};

#endif