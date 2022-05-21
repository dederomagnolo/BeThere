const Command = require('../app/models/command');
const {COMMANDS_BY_VALUE} = require('./consts');
const _ = require('lodash');

const sendCommandWhenClientSendFeedback = async ({
    commandFromRemote, 
    deviceSerialKey,
    userId,
    deviceId
}) => {
    const shouldSendFeedbackToDB = _.find(COMMANDS_BY_VALUE, (command) => {
        return command.value === commandFromRemote && command.needFeedBack;
    });

    if(shouldSendFeedbackToDB) {
        const commandCategory = _.get(shouldSendFeedbackToDB, 'name')
        await Command.create({
            categoryName: commandCategory,
            changedFrom: deviceSerialKey,
            commandName: commandFromRemote,
            userId,
            deviceId
        });
    }
}

module.exports = sendCommandWhenClientSendFeedback;