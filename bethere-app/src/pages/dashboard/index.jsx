import React, { useState, useEffect } from 'react';
import Toggle from 'react-styled-toggle';
import {LeftArrow, RightArrow} from '@styled-icons/boxicons-regular';
import * as _ from 'lodash';
import moment from 'moment';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import MomentLocaleUtils from 'react-day-picker/moment';
import api from '../../services';
import { Header } from '../../components/header';
import { setColorId, isOdd, setMeasureId } from './utils';
import {NewCard} from '../../components/newCard';
import {Cards, MainContainer, DateContainer} from './styles';
import {Graph} from './graph';
import {isFromApp} from './utils';
import { thingspeakUrl, bethereUrl} from '../../services/configs';
import COMMANDS from '../../services/commands';
import 'react-day-picker/lib/style.css';

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
    const [blockButtonFlag, setBlockButtonFlag] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
/*     const [minutes, setMinutesLeft] = useState(null);
    const [seconds, setSecondsLeft] = useState(null); */
    const [isCommandFromApp, setFromApp] = useState(false);
    const [pumpCountDown, setPumpCountDown] = useState("");
    const [measures, setMeasures] = useState(initialState.measures);
    const [temperatureData, setTemperatureData] = useState([]);
    const [humidityData, setHumidityData] = useState([]);
    const [showTemperatureChart, setShowTemperatureChart] = useState(true);
    const [showHumidityChart, setShowHumidityChart] = useState(false);
    const { formatDate, parseDate } = MomentLocaleUtils;
    // Week Logics
    /* const lastWeekStartDate = moment().subtract(5, 'days').format("YYYY-MM-DD"); */
    /* const queryStart = `${lastWeekStartDate}%2000:00:00`; */
    /* const queryEnd = `${endOfDay}%2000:00:00`  */

    // field 3: internal humidity
    // field 4: internal temperature
    // field 5: external humidity
    // field 6: external temperature
    // field 7: pump indicator

    const handleDateChange = (date) => {
        const momentDate = moment(date);
        console.log(momentDate);
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

    const updatePumpFromRemote = async () => {
        try{
            const pumpStatusResponse = await api.post(`${bethereUrl}/commands/laststatus`, {
                commandName: COMMANDS.PUMP.NAME
            });
            
            const lastPumpStatus = _.get(pumpStatusResponse, 'data.value');
            if(pumpStatusResponse) {
                const commandSentBy = _.get(pumpStatusResponse, 'data.changedFrom');
                const isCommandFromApp = isFromApp(commandSentBy);
                setFromApp(isCommandFromApp);
            }

            if(lastPumpStatus === COMMANDS.PUMP.ON) {
                setPumpFlag(true);
                const today = moment();
                const lastPumpUpdate = _.get(pumpStatusResponse, 'data.createdAt');
                const interval = moment(today).diff(lastPumpUpdate);
                const remainingTime = pumpTimeSetPoint - interval;
                const d = moment.duration(remainingTime, 'milliseconds');
                const secs = Math.floor(d.seconds());
                const mins = Math.floor(d.asMinutes());                
               
                if(mins < 0 || secs < 0) {
                    await api.post(`${bethereUrl}/send`, {
                        commandName: "Pump Status",
                        changedFrom: "App",
                        value: COMMANDS.PUMP.OFF
                    });
                    setPumpFlag(false);
                } else {
                    setTimeLeft(`${mins}:${secs}`);
                }
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

    useEffect(() => {
        updatePumpFromRemote();
        updateFeedFromRemote();

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
        try{
            const pumpStatusReponse = await api.post(`${bethereUrl}/commands/laststatus` , {
                commandName: COMMANDS.PUMP.NAME
            });
            setBlockButtonFlag(true);
            const pumpStatus = _.get(pumpStatusReponse, 'data.value');
            console.log(pumpStatus);
            if(pumpStatus === COMMANDS.PUMP.ON) {
                await api.post(`${bethereUrl}/send`, {
                    commandName: COMMANDS.PUMP.NAME,
                    changedFrom: "App",
                    value: COMMANDS.PUMP.OFF
                });
                setPumpFlag(false);
            } else {
                const commandRes = await api.post(`${bethereUrl}/send`, {
                    commandName: COMMANDS.PUMP.NAME,
                    changedFrom: "App",
                    value: COMMANDS.PUMP.ON
                });
                setPumpFlag(true);
                const createdAt = _.get(commandRes, 'data.createdAt');
                const today = moment();
                const interval = moment(today).diff(createdAt);
                const remainingTime = pumpTimeSetPoint - interval;
                const d = moment.duration(remainingTime, 'milliseconds');
                const secs = Math.floor(d.seconds());
                const mins = Math.floor(d.asMinutes());
            }
            setBlockButtonFlag(false);
        } catch(err) {
          console.log(err);
        }    
    }

    return (
        <MainContainer>
            <Header title="Dashboard"/>
            <div>
                {/* <span style={{fontSize: "20px"}}>Hello! Your garden looks good today:</span> */}
                <Cards>
                    <NewCard 
                        label={"Temperature (°C)"} 
                        icon={"thermometer half"} 
                        internalMeasure={measures.internalTemperature} 
                        externalMeasure={measures.externalTemperature}
                        onClick={() => {
                            setShowTemperatureChart(true);
                            setShowHumidityChart(false);
                        }}
                    />
                    <NewCard 
                        label={"Humidity (%)"} 
                        icon={"tint"} 
                        internalMeasure={measures.internalHumidity} 
                        externalMeasure={measures.externalHumidity} 
                        onClick={() => {
                            setShowHumidityChart(true)
                            setShowTemperatureChart(false);
                        }}
                    />
                    <NewCard 
                        label={"Pump Control"} 
                        icon={"cog"}
                        pump={true}
                        children={
                            <div>
                                <Toggle 
                                    backgroundColorChecked="#3bea64" 
                                    disabled={blockButtonFlag} 
                                    checked={pumpFlag} 
                                    onChange={() => updatePump()}
                                />
                                {!pumpFlag 
                                    ? <div>{"Available!"}</div>
                                    : <div>Remaining time: {timeLeft} mins</div> 
                                }
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