import COMMANDS from './commands';
import callApi from './callApi';

const APP = 'App';

const payloadList = {
    MANUAL_PUMP_ON: {
        categoryName: COMMANDS.MANUAL_PUMP.NAME,
        commandName: COMMANDS.MANUAL_PUMP.ON,
    },
    MANUAL_PUMP_OFF: {
        categoryName: COMMANDS.MANUAL_PUMP.NAME,
        commandName: COMMANDS.MANUAL_PUMP.OFF,
    },
    WATERING_AUTO_ON: {
        categoryName: COMMANDS.WATERING_ROUTINE_MODE.NAME,
        commandName: COMMANDS.WATERING_ROUTINE_MODE.ON,
    },
    WATERING_AUTO_OFF: {
        categoryName: COMMANDS.WATERING_ROUTINE_MODE.NAME,
        commandName: COMMANDS.WATERING_ROUTINE_MODE.OFF,
    },
    AUTO_PUMP_ON: {
        categoryName: COMMANDS.WATERING_ROUTINE_PUMP.NAME,
        commandName: COMMANDS.WATERING_ROUTINE_PUMP.ON,
    },
    AUTO_PUMP_OFF: {
        categoryName: COMMANDS.WATERING_ROUTINE_PUMP.NAME,
        commandName: COMMANDS.WATERING_ROUTINE_PUMP.OFF,
    },
    BACKLIGHT_ON: {
        categoryName: COMMANDS.BACKLIGHT.NAME,
        commandName: COMMANDS.BACKLIGHT.ON,
    },
    BACKLIGHT_OFF: {
        categoryName: COMMANDS.BACKLIGHT.NAME,
        commandName: COMMANDS.BACKLIGHT.OFF,
    },
    SETTINGS_ON: {
        categoryName: COMMANDS.SETTINGS.NAME,
        commandName: COMMANDS.SETTINGS.ON,
    }
}

async function sendCommand (command, value) {
    const payloadToSend = payloadList[command];
    return await callApi(
        'POST',
        '/send',
        {
            ...payloadToSend, 
            value,
            changedFrom: APP
        }
    )
}

export default sendCommand;