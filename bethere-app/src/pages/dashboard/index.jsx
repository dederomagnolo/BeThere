import React, {useState, useEffect} from 'react';
import 'react-day-picker/lib/style.css';
import Toggle from 'react-styled-toggle';
import {LeftArrow, RightArrow} from '@styled-icons/boxicons-regular';
import * as _ from 'lodash';
import moment from 'moment';
import {Pulse} from 'styled-spinkit';
import {useSelector, useDispatch} from 'react-redux';
import {useTranslate} from 'react-translate';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import MomentLocaleUtils from 'react-day-picker/moment';
import api from '../../services';
import {thingspeakUrl, bethereUrl} from '../../services/configs';
import {Header} from '../../components/header';
import {setColorId, isOdd, setMeasureId} from './utils';
import {NewCard} from '../../components/newCard';
import {Cards, MainContainer, DateContainer} from './styles';
import {Graph} from './graph';
import {getUserId, getUserDevices} from '../../store/user/selectors';
import {updateDeviceSettings} from '../../store/user/actions';
import {COMMANDS} from '../../services/commands';
import sendCommand from '../../services/sendCommand';

const initialState = {
    measures: { 
        internalHumidity: '' , 
        internalTemperature: '' , 
        externalHumidity: '' , 
        externalTemperature: ''
    }
}

const pumpTimeSetPoint = 1200000;

export const Dashboard = () => {
    const [pumpFlag, setPumpFlag] = useState(false);
    const userDevices = useSelector(getUserDevices);
    const userId = useSelector(getUserId);
    const [selectedDevice, setSelectedDevice] = useState(_.get(userDevices, '[0]'));
    const deviceId = _.get(selectedDevice, '_id');
    const [blockButtonFlag, setBlockButtonFlag] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [measures, setMeasures] = useState(initialState.measures);
    const [temperatureData, setTemperatureData] = useState([]);
    const [humidityData, setHumidityData] = useState([]);
    const [showTemperatureChart, setShowTemperatureChart] = useState(true);
    const [showHumidityChart, setShowHumidityChart] = useState(false);
    const [localStationStatus, setLocalStationStatus] = useState(false);
    const { formatDate, parseDate } = MomentLocaleUtils;
    const deviceSerialKey = _.get(_.get(userDevices, '[0]'), 'deviceSerialKey');
    const wateringRoutineSettings = _.get(userDevices, '[0].settings[0].wateringRoutine');
    const wateringEnabled = _.get(wateringRoutineSettings, 'enabled');
    const autoWateringDuration = _.get(wateringRoutineSettings, 'duration'); // in minutes always
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const translate = useTranslate("home");

    const handleDateChange = (date) => {
        const momentDate = moment(date);
        setSelectedDate(momentDate);
    }

    const goToNextDay = () => {
        const nextDay = moment(selectedDate).add(1, 'days').format('YYYY/MM/DD');
        setSelectedDate(nextDay);
    }

    const goToPreviousDay = () => {
        const previousDay = moment(selectedDate).subtract(1, 'days').format('YYYY/MM/DD');
        setSelectedDate(previousDay);
    }

    const calculateRemainingTime = (commandResponse) => {
        const today = moment();
        const lastPumpUpdate = _.get(commandResponse, 'data.createdAt');
        const interval = moment(today).diff(lastPumpUpdate);
        const remainingTime = pumpTimeSetPoint - interval;
        const d = moment.duration(remainingTime, 'milliseconds');
        const secs = Math.floor(d.seconds());
        const mins = Math.floor(d.asMinutes());
        
        return { mins, secs };
    }

    useEffect(() => {
        const updatePumpFromRemote = async () => {
            try {
                let remainingTime;
                const lastStatusAll = await api.post(`${bethereUrl}/commands/laststatus/all`);
                const lastAutoPumpStatus = _.get(lastStatusAll, 'data.autoPump.commandName');
                const lastPumpStatus = _.get(lastStatusAll, 'data.manualPump.commandName');
    
                if(lastAutoPumpStatus === COMMANDS.WATERING_ROUTINE_PUMP.ON){
                    setPumpFlag(true);
                    remainingTime = calculateRemainingTime(lastAutoPumpStatus); 
                }
    
                if(lastPumpStatus === COMMANDS.MANUAL_PUMP.ON) {
                    setPumpFlag(true);
                    remainingTime = calculateRemainingTime(lastPumpStatus); 
                } 
    
                if(remainingTime && (remainingTime.mins < 0 || remainingTime.secs < 0)) {
                    setPumpFlag(false);
                } else {
                    setTimeLeft(`${remainingTime.mins}:${remainingTime.secs}`);
                }
    
            } catch(err) {
              console.log(err);
            }
        }
    
        const updateFeedFromRemote = async () => {
            try {
                setTemperatureData([]);
                setHumidityData([]);
                const lastFeed = await api.get(`${thingspeakUrl}/feeds/last.json`);
                const internalHumidity = _.get(lastFeed, 'data.field3');
                const internalTemperature = _.get(lastFeed, 'data.field4');
                const externalHumidity = _.get(lastFeed, 'data.field5');
                const externalTemperature = _.get(lastFeed, 'data.field6');
    
                const  measuresFromRemote  = {
                    internalHumidity: internalHumidity && internalHumidity !== 'nan' ? Number(internalHumidity).toFixed(2) : "-",
                    internalTemperature: internalTemperature && internalTemperature !== 'nan' ? Number(internalTemperature).toFixed(2) : "-",
                    externalHumidity: externalHumidity && externalHumidity !== 'nan' ? Number(externalHumidity).toFixed(2) : "-",
                    externalTemperature: externalTemperature && externalTemperature !== 'nan' ? Number(externalTemperature).toFixed(2) : "-"
                }
                           
                setMeasures(measuresFromRemote);
            } catch (err) {
                console.log(err);
            }
        }
    
        const updateFields = async (fieldNumber) => {
            //const today = moment().format('YYYY-MM-DD');
            const nextDay = moment(selectedDate).add(1, 'days').format('YYYY-MM-DD');

            const queryStart = `${moment(selectedDate).format('YYYY-MM-DD')}%2003:00:00`;
            const queryEnd = `${nextDay}%2003:00:00`; //check this timezone to use utc
            /* const queryStart = "2020-12-31%2003:00:00"
            const queryEnd = "2021-01-01%2003:00:00" */

            try {
                const response = await api.get(`${thingspeakUrl}/fields/${fieldNumber}.json?start=${queryStart}&end=${queryEnd}`);  // 
                const weekFeed = _.get(response, 'data.feeds');
                const weekFeedSlice = _.slice(weekFeed, 50);
                const data = [];
                await _.each(weekFeed, (entry, index) => {
                    // if(isOdd(index)) {
                        const created_at = _.get(entry, 'created_at');
                        const fieldMeasure = _.get(entry, `field${fieldNumber}`);
                        data.push({
                            "x": moment(created_at).format('HH:mm'),
                            "y": fieldMeasure && fieldMeasure !== "nan" ? Number(fieldMeasure).toFixed(2) : "30"
                        });
                    // }
                });

                if(fieldNumber === 4 || fieldNumber === 6) { // internal temperature and external temperature
                    setTemperatureData((temperatureData) => [...temperatureData, {
                        "id" : setMeasureId(fieldNumber),
                        "color": setColorId(fieldNumber),
                        "data": data
                    }]);
                } else {
                    setHumidityData((humidityData) => [...humidityData, {
                        "id" : setMeasureId(fieldNumber),
                        "color": setColorId(fieldNumber),
                        "data": data
                    }]);
                }
            } catch(err) {
                console.log(err);
            }
        }

        const getLocalStationStatus = async () => {
            try {
                setLoading(true);
                const localStationStatus = await api.post(`${bethereUrl}/ls-status`, {deviceSerialKey});
                setLocalStationStatus(_.get(localStationStatus, 'data.isDeviceConnected'));
                setLoading(false);
            } catch (err) {
                setLoading(false);
                console.log(err);
            }
        }

        getLocalStationStatus(); // I need to put this on redux store

        updatePumpFromRemote();
        updateFeedFromRemote();
        // field 3: internal humidity
        // field 4: internal temperature
        // field 5: external humidity
        // field 6: external temperature
        // field 7: pump indicator

        updateFields(4);
        updateFields(6);
        updateFields(3);
        updateFields(5);

    }, [selectedDate]);
        
    const updatePump = async () => {
        try {
        setBlockButtonFlag(true);
        const lastStatusAll = await api.post(`${bethereUrl}/commands/laststatus/all`);

        if(lastStatusAll) {
            const lastAutoPumpStatus = _.get(lastStatusAll, 'data.autoPump.commandName');
            const lastPumpStatus = _.get(lastStatusAll, 'data.manualPump.commandName');
            if(lastAutoPumpStatus === COMMANDS.WATERING_ROUTINE_PUMP.ON) {
                await sendCommand('AUTO_PUMP_OFF', userId, deviceId);
                setBlockButtonFlag(false);
                return setPumpFlag(false);
            }
            
            if(lastPumpStatus === COMMANDS.MANUAL_PUMP.ON) {
                await sendCommand('MANUAL_PUMP_OFF', userId, deviceId);
                setBlockButtonFlag(false);
                return setPumpFlag(false);
            } 
            
            if(lastPumpStatus === COMMANDS.MANUAL_PUMP.OFF) {
                await sendCommand('MANUAL_PUMP_ON', userId, deviceId);
                setBlockButtonFlag(false);
                return setPumpFlag(true);
            }
        }
 
        } catch(err) {
            console.log(err);
        }
    }

    const renderAutoWateringLabel = () => {
        return wateringEnabled 
            ? <span style={{color: 'green'}}>{translate('onLabel')}</span> 
            : <span style={{color: 'red'}}>{translate('offLabel')}</span>;
    }

    const renderStatusLabel = () => {
        if (localStationStatus) {
            return (
                !pumpFlag 
                    ? <span style={{color: 'green'}}>{translate('localStationStatusOnLabel')}</span> 
                    : <div>Remaining time: {timeLeft} mins</div> 
            );
        } else {
            return (
                <span style={{color: 'red'}}>
                    {translate('localStationStatusOffLabel')}
                </span>);
        }
    }

    return (
        <MainContainer>
            <Header title={translate('title')} />
            <div>
                {/* <span style={{fontSize: "20px"}}>Hello! Your garden looks good today:</span> */}
                <Cards>
                    <NewCard 
                        label={`${translate('temperatureLabel')} (°C)`} 
                        icon={"thermometer half"} 
                        internalMeasure={measures.internalTemperature} 
                        externalMeasure={measures.externalTemperature}
                        onClick={() => {
                            setShowTemperatureChart(true);
                            setShowHumidityChart(false);
                        }}
                    />
                    <NewCard 
                        label={`${translate('humidityLabel')} (%)`} 
                        icon={"tint"} 
                        internalMeasure={measures.internalHumidity} 
                        externalMeasure={measures.externalHumidity} 
                        onClick={() => {
                            setShowHumidityChart(true)
                            setShowTemperatureChart(false);
                        }}
                    />
                    <NewCard 
                        label={translate('wateringLabel')} 
                        icon={"cog"}
                        pump={true}
                        children={
                           loading ? <Pulse size={20} /> : <div style={{display: 'flex', flexDirection: "column" , alignItems: 'center'}}>
                                <div>
                                    Auto: {renderAutoWateringLabel()}
                                </div>
                                <div style={{padding: '3px 0 3px'}}>
                                    <Toggle 
                                        backgroundColorChecked="#3bea64" 
                                        disabled={!localStationStatus || blockButtonFlag} 
                                        checked={pumpFlag} 
                                        onChange={() => updatePump()}
                                    />
                                </div>
                                {renderStatusLabel()}
                            </div>
                            }
                        >
                    </NewCard>
                </Cards>
                {/* <Cards>
                    <NewCard 
                            label={"CO2 (ppm)"} 
                            icon={"asterisk"} 
                            internalMeasure={measures.internalHumidity} 
                            externalMeasure={measures.externalHumidity} 
                            onClick={() => {
                                setShowHumidityChart(true)
                                setShowTemperatureChart(false);
                            }}
                    />
                </Cards> */}
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
                {showTemperatureChart && temperatureData.length > 0 && <Graph chartData={temperatureData}/>}
                {showHumidityChart && humidityData.length > 0 && <Graph chartData={humidityData}/>}
                {/* {chartData.length > 0 && <Graph chartData={temperatureData}/>} */}
            </div>
        </MainContainer>
    );
}