export function setUserDevices(payload) {
    return {
      type: "SET_USER_DEVICES",
      payload
    }
}

export function updateDeviceSettings(payload) {
  return {
    type: "UPDATE_DEVICE_SETTINGS",
    payload
  }
}

export function clearDevicesState() {
  return {
    type: "CLEAR_DEVICES_STATE"
  }
}


  