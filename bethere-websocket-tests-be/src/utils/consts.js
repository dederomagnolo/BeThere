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
    RESET: 'Reset',
    SETTINGS: {
        NAME: 'Settings',
        ON: 'SETTINGS'
    }
}

const COMMANDS_BY_VALUE = [
    {
        value: 'MP0',
        name: COMMANDS.MANUAL_PUMP.NAME,
        needFeedBack: true
    },
    {
        value: 'MP1',
        name: COMMANDS.MANUAL_PUMP.NAME,
        needFeedBack: false
    },
    {
        value: 'WR_ON',
        name: COMMANDS.WATERING_ROUTINE_MODE.NAME,
        needFeedBack: true
    },
    {
        value: 'WR_OFF',
        name: COMMANDS.WATERING_ROUTINE_MODE.NAME,
        needFeedBack: true
    },
    {
        value: 'WR_PUMP_ON',
        name: COMMANDS.WATERING_ROUTINE_PUMP.NAME,
        needFeedBack: true
    },
    {
        value: 'WR_PUMP_OFF',
        name: COMMANDS.WATERING_ROUTINE_PUMP.NAME,
        needFeedBack: true
    }
]

const CATEGORIES = {
    0: 'Manual Pump',
    1: 'Watering Routine Mode',
    2: 'Watering Routine Pump',
    3: 'Backlight',
    4: 'Measure Interval',
    5: 'Reset',
    6: 'Settings'
}

module.exports = {
    COMMANDS, 
    COMMANDS_BY_VALUE
};
