#ifndef BETHERE_H
#define BETHERE_H

#include <Arduino.h>

class BeThere {
	public:
        String getAccessPointPage();
        String getServerUri(bool devMode);
        bool getDevMode();
};

#endif