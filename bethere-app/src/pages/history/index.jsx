import React, {useState, useEffect} from 'react';
import Select from 'react-select'
import 'react-day-picker/lib/style.css';
import {LeftArrow, RightArrow} from '@styled-icons/boxicons-regular';
import * as _ from 'lodash';
import {useSelector, useDispatch} from 'react-redux';
import {useTranslate} from 'react-translate';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import MomentLocaleUtils from 'react-day-picker/moment';
import moment from 'moment-timezone';
import {Container} from 'react-grid-system';

import {COMMANDS} from '../../services/commands';
import {Header} from '../../components/header';
import {
    getDeviceSettings,
    getDeviceOptionsToSelect
} from '../../utils/functions';

import {getUserDevices, getUserId} from '../../store/user/selectors';

import { 
    InnerContent, 
    CommandLabels, 
    CommandCard,
    CommandCategory,
    GreenLabel,
    RedLabel,
    BlueLabel,
    CommandsList
} from './styles';
import {OptionLabel} from '../settings/styles';
import {DateContainer} from '../dashboard/styles';
import callApi from '../../services/callApi'

const History = () => {
    const { formatDate, parseDate } = MomentLocaleUtils;
    const translate = useTranslate('history');
	const dispatch = useDispatch();
    const userDevices = useSelector(getUserDevices);
    const userId = useSelector(getUserId);

    const [deviceSettings, setDeviceSettings] = useState(_.get(userDevices, '[0].settings[0]'));
    const [selectedDevice, setSelectedDevice] = useState(
        _.get(userDevices, '[0]')
    );
    const [selectedDate, setSelectedDate] = useState(moment().tz('America/Sao_Paulo').startOf('day').format());
    const [commandList, setCommandList] = useState([]);

    const deviceId = _.get(selectedDevice, '_id');

    const handleGetHistory = async (date) => {
        const res = await callApi(
            'POST', 
            '/commands/history', 
            { 
                deviceId,
                dayToRetrieveHistory: date 
            }
        );
        const historyForDate = _.get(res, 'historyForDate');
        setCommandList(historyForDate);
    }

    useEffect(() => {
        const selectedDeviceSettings = getDeviceSettings();
        setDeviceSettings(selectedDeviceSettings);
    }, [deviceId]);

    useEffect(() => {
        handleGetHistory(selectedDate);
    }, [])

    const handleSetSelectedDevice = (selected) => {
        const device = _.find(
          userDevices,
          (device) => selected.value === device._id
        );
        setSelectedDevice(device);
    };

    const handleDateChange = async (date) => {
        const momentDate = moment(date).tz('America/Sao_Paulo').startOf('day').format();
        await handleGetHistory(momentDate);
        setSelectedDate(momentDate);
    }

    const goToNextDay = async () => {
        const nextDay = moment(selectedDate).add(1, 'days').startOf('day').format();
        await handleGetHistory(nextDay);
        setSelectedDate(nextDay);
    }

    const goToPreviousDay = async () => {
        const previousDay = moment(selectedDate).subtract(1, 'days').startOf('day').format();
        await handleGetHistory(previousDay);
        setSelectedDate(previousDay); 
    }

    const getCommandLabel = (commandName) => {
        switch(commandName) {
            case 'MP0':
            case 'WR_PUMP_OFF':
            case 'WR_OFF':
                return <RedLabel>OFF</RedLabel>
            case 'MP1':
            case 'WR_PUMP_ON':
            case 'WR_ON':
                return <GreenLabel>ON</GreenLabel>
            case 'SETTINGS':
                return <BlueLabel>SET</BlueLabel>
            default:
                return <div>{commandName}</div>
        }
    }

    const getCategoryLabel = (commandCategory) => {
        switch(commandCategory) {
            case COMMANDS.MANUAL_PUMP.NAME:
                return translate('manualPumpCategory')
            case COMMANDS.WATERING_ROUTINE_PUMP.NAME:
                return translate('wateringRoutineCategory')
            case COMMANDS.WATERING_ROUTINE_MODE.NAME:
                return translate('autoWateringMode')
            case COMMANDS.SETTINGS.NAME:
                return translate('settings')
            default:
                return ''
        }
    }

    const orderedCommandsList = _.orderBy(commandList, 'createdAt', 'desc');

    return (
        <Container style={{ height: "100%", minWidth: "80%" }}>
            <Header title="Histórico" />
            <OptionLabel>Dispositivo</OptionLabel>
            <InnerContent>
                <Select
                    isSearchable={false}
                    styles={{
                        container: (provided) => ({
                        ...provided,
                        marginTop: "15px",
                        width: "300px",
                        }),
                    }}
                    defaultValue={_.get(getDeviceOptionsToSelect(userDevices), [0])}
                    onChange={handleSetSelectedDevice}
                    options={getDeviceOptionsToSelect(userDevices)}
                />
            </InnerContent>
            <DateContainer>
                    <LeftArrow fill="#1491a869" size={20} onClick={goToPreviousDay}/>
                    <DayPickerInput
                        formatDate={formatDate}
                        format="DD/MM/YYYY"
                        parseDate={parseDate}
                        onDayChange={handleDateChange}
                        value={moment(selectedDate).format('DD/MM/YYYY')}
                        placeholder={'Select a date'}
                        style={{ fontSize: '14px', marginTop: '10px' }}
                        dayPickerProps={{
                            locale: 'pt-br',
                            localeUtils: MomentLocaleUtils,
                        }}
                    />
                    <RightArrow fill="#1491a869" size={20} onClick={goToNextDay} />
            </DateContainer>

            <CommandsList>
                {_.map(orderedCommandsList, (command) => {
                    const commandName = _.get(command, 'commandName');
                    const commandCategory = _.get(command, 'categoryName');
                    const createdAt = _.get(command, 'createdAt');
                    return (
                        <CommandCard>
                            <div>{moment(createdAt).tz('America/Sao_Paulo').format("HH:mm")}</div>
                            <CommandLabels>
                                <CommandCategory>{getCategoryLabel(commandCategory)}</CommandCategory>
                                {getCommandLabel(commandName)}
                            </CommandLabels>
                        </CommandCard>
                    )
                })}
            </CommandsList>
        </Container>
    );
}

export default History;