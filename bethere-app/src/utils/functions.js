import _ from 'lodash';

export const  minutesToMilliseconds = (time) => {
    return time*60*1000;
}

export const secondsToMilliseconds = (time) => {
    return time*1000;
}

export const getDeviceSettings = (userDevices, deviceId) => {
    const selectedDeviceData = _.find(
      userDevices,
      (device) => deviceId === device._id
    );
    return _.get(selectedDeviceData, "settings[0]");
};

export const getDeviceOptionsToSelect = (userDevices) => {
    return _.map(userDevices, (device) => {
        return {
          value: device._id,
          label: device.deviceSerialKey,
        };
    })
};
