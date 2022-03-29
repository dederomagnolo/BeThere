#include "Bethere.h"

#define DEV_MODE true
#define WEBSOCKET_SERVER_HOST "https://bethere-be.herokuapp.com/"
#define WEBSOCKET_SERVER_LOCAL_IP "http://192.168.15.23"
#define WEBSOCKET_LOCAL_PORT "8080"
#define SERIAL_KEY_PROD "35U2I-MAQOO-EXQX5-U43PI"
#define SERIAL_KEY_DEV "A0CAA-DN6PV-6U2OD-NPY1Q"

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


String BeThere::getServerUri (bool devMode) {
    if (devMode) {
        return String(WEBSOCKET_SERVER_LOCAL_IP) + ":" + String(WEBSOCKET_LOCAL_PORT) + String("/?id=" + String(SERIAL_KEY_DEV));
    } else {
        return String(WEBSOCKET_SERVER_HOST) + String("?id=" + String(SERIAL_KEY_PROD));
    }
}

bool BeThere::getDevMode () {
    return DEV_MODE;
}