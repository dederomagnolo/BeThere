#include "Bethere.h"

#define DEV_MODE true
#define WEBSOCKET_SERVER_HOST "https://bethere-be.herokuapp.com/"
#define WEBSOCKET_SERVER_LOCAL_IP "http://192.168.0.26"
#define WEBSOCKET_LOCAL_PORT "8080"
#define SERIAL_KEY_DEV "A0CAA-DN6PV-6U2OD-NPY1Q"

String SERIAL_KEY_PROD_COLLECTION[2] = {
    "35U2I-MAQOO-EXQX5-U43PI",
    "M5YZ5-XJKLW-7P5Q2-7ENRY"
};

String BeThere::getAccessPointPage() {
    const char INDEX_HTML[] =
      "<!DOCTYPE HTML>"
      "<html>"
      "<head>"
      "<meta content=\"text/html; charset=ISO-8859-1\""
      " http-equiv=\"content-type\">"
      "<meta name = \"viewport\" content = \"width = device-width, initial-scale = 1.0, maximum-scale = 1.0, user-scalable=0\">"
      "<title>BeThere - Network Settings</title>"
      "<style>"
      "\"body { background-color: #808080; font-family: Arial, Helvetica, Sans-Serif; Color: #000000; }\""
      "</style>"
      "</head>"
      "<body>"
      "<h1>BeThere - Network Settings</h1>"
      "<FORM action=\"/\" method=\"post\">"
      "<P>"
      "<label>ssid:&nbsp;</label>"
      "<input maxlength=\"30\" name=\"ssid\"><br>"
      "<label>Password:&nbsp;</label><input maxlength=\"30\" name=\"Password\"><br>"
      "<INPUT type=\"submit\" value=\"Send\">"
      "</P>"
      "</FORM>"
      "<button onclick=\"window.location.href='/reset'\"> Reset network configs </button>"
      "<button onclick=\"window.location.href='/without-wifi'\">  Start without connection </button>"
      "</body>"
      "</html>";

	return INDEX_HTML;
}


String BeThere::getServerUri (bool devMode, bool useLocalHost) {
    if (devMode && useLocalHost) {
        return String(WEBSOCKET_SERVER_LOCAL_IP) + ":" + String(WEBSOCKET_LOCAL_PORT);
    } else {
        return String(WEBSOCKET_SERVER_HOST);
    }
}

bool BeThere::getDevMode () {
    return DEV_MODE;
}

String BeThere::getSerialKey(enum SERIAL_KEY_PROD_SHORT shortDeviceId) {
   return SERIAL_KEY_PROD_COLLECTION[shortDeviceId];
}

char * BeThere::getConfig(enum SERIAL_KEY_PROD_SHORT shortDeviceId) {
    switch(shortDeviceId) {
        case 0:
            return "{\"SERIAL_KEY_PROD\": \"35U2I-MAQOO-EXQX5-U43PI\",\"ENABLE_RELAY_LOW\": true,\"ENABLE_ANALOG_SENSOR\": false,\"ENABLE_LCD\": true,\"ENABLE_RELAY_PUSH_BUTTON\": false,\"RELAY_PIN\": 16,\"SSID\": \"Cogumelos Sao Carlos\",\"PASSWORD\": \"cogu2409\",\"TS_CHANNEL_NUM\": 695672,\"TS_WRITE_API_KEY\": \"ZY113X3ZSZG96YC8\"}";
        case 1:
            return "{\"SERIAL_KEY_PROD\": \"M5YZ5-XJKLW-7P5Q2-7ENRY\",\"ENABLE_RELAY_LOW\": false,\"ENABLE_ANALOG_SENSOR\": false,\"ENABLE_LCD\": false,\"ENABLE_RELAY_PUSH_BUTTON\": true,\"RELAY_PIN\": 13,\"PUSH_BUTTON_PIN\": 12,\"SSID\": \"Satan`s Connection\",\"PASSWORD\": \"tininha157\",\"TS_CHANNEL_NUM\": 700837,\"TS_WRITE_API_KEY\": \"EZWNLFRNU5LW6XKU\"}";
    }

}

