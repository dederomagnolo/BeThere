const COMMANDS = {
    MANUAL_PUMP: {
        NAME: 'Manual Pump',
        ON: 'MP1',
        OFF: 'MP0'
    },
    WATERING_ROUTINE_MODE: {
        NAME: 'Watering Routine Mode',
        ON: 'WR_ON',
        OFF: 'WR_OFF',
    },
    WATERING_ROUTINE_PUMP: {
        NAME: 'Watering Routine Pump',
        ON: 'WR_PUMP_ON',
        OFF: 'WR_PUMP_OFF'
    },
    BACKLIGHT: {
        NAME: 'Backlight',
        ON: 'LCD_ON',
        OFF: 'LCD_OFF'
    },
    MEASURE_INTERVAL: 'Measure Interval',
    SETTINGS: {
        NAME: 'Settings',
        ON: 'SETTINGS'
    },
    SYSTEM: {
        NAME: 'System',
        RESET_RELAY: 'RESET_RELAY_STATE',
        RESET_ESP: 'RESET_ESP'
    }
}

const COMMANDS_BY_VALUE = [
    {
        value: COMMANDS.MANUAL_PUMP.OFF,
        name: COMMANDS.MANUAL_PUMP.NAME,
        needFeedBack: true
    },
    {
        value: COMMANDS.MANUAL_PUMP.ON,
        name: COMMANDS.MANUAL_PUMP.NAME,
        needFeedBack: false
    },
    {
        value: COMMANDS.WATERING_ROUTINE_MODE.ON,
        name: COMMANDS.WATERING_ROUTINE_MODE.NAME,
        needFeedBack: true
    },
    {
        value: COMMANDS.WATERING_ROUTINE_MODE.OFF,
        name: COMMANDS.WATERING_ROUTINE_MODE.NAME,
        needFeedBack: true
    },
    {
        value: COMMANDS.WATERING_ROUTINE_PUMP.ON,
        name: COMMANDS.WATERING_ROUTINE_PUMP.NAME,
        needFeedBack: true
    },
    {
        value: COMMANDS.WATERING_ROUTINE_PUMP.OFF,
        name: COMMANDS.WATERING_ROUTINE_PUMP.NAME,
        needFeedBack: true
    },
    {
        value: COMMANDS.SYSTEM.RESET_RELAY,
        name: COMMANDS.SYSTEM.NAME,
        needFeedBack: true
    },
    {
        value: COMMANDS.SYSTEM.RESET_ESP,
        name: COMMANDS.SYSTEM.NAME,
        needFeedBack: true
    }
]

const CATEGORIES = {
    0: 'Manual Pump',
    1: 'Watering Routine Mode',
    2: 'Watering Routine Pump',
    3: 'Backlight',
    4: 'Measure Interval',
    5: 'System',
    6: 'Settings'
}

module.exports = {
    COMMANDS, 
    COMMANDS_BY_VALUE
};
