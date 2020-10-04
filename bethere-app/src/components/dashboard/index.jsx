import React, { useState, useEffect } from 'react';
import { Header } from '../header';
import Toggle from 'react-styled-toggle';
import api from '../../services';
import * as _ from 'lodash';
import moment from 'moment';
import { ResponsiveLine } from '@nivo/line'; 
import { setColorId, isOdd, setMeasureId } from './utils';
import {NewCard} from '../newCard';
import {Cards} from './styles';

const base_channel_url = "https://api.thingspeak.com/channels/695672"
const bethereUrl = "http://localhost:4000";

const initialState = {
    measures: { 
        internalHumidity: '' , 
        internalTemperature: '' , 
        externalHumidity: '' , 
        externalTemperature: ''
    }
}

export const Dashboard = () => {
    const [pumpFlag, setPumpFlag] = useState(null);
    const [blockButtonFlag, setBlockButtonFlag] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null);
    const [measures, setMeasures] = useState(initialState.measures);
    const [chartData, setChartData] = useState([]);
    
    const today = moment().format('YYYY-MM-DD');
    const nextDay = moment().add(1, 'days').format('YYYY-MM-DD');

    const queryStart = `${today}%2000:00:00`;
    const queryEnd = `${nextDay}%2000:00:00`;

    // Week Logics
    /* const lastWeekStartDate = moment().subtract(5, 'days').format("YYYY-MM-DD"); */
    /* const queryStart = `${lastWeekStartDate}%2000:00:00`; */
    /* const queryEnd = `${endOfDay}%2000:00:00`  */

    // field 3: internal humidity
    // field 4: internal temperature
    // field 5: external humidity
    // field 6: external temperature
    // field 7: pump indicator

    const updateDataFromRemote = async () => {
        try{
            const pumpStatusResponse = await api.get(`${bethereUrl}/measures/pumpstatus`);
            const lastFeed = await api.get(`${base_channel_url}/feeds/last.json`);
            const lastPumpStatus = _.get(pumpStatusResponse, 'data.value');

            const internalHumidity = _.get(lastFeed, 'data.field3');
            const internalTemperature = _.get(lastFeed, 'data.field4');
            const externalHumidity = _.get(lastFeed, 'data.field5');
            const externalTemperature = _.get(lastFeed, 'data.field6');

            const  measuresFromRemote  = {
                internalHumidity: internalHumidity ? Number(internalHumidity).toFixed(2) : "-",
                internalTemperature: internalTemperature ? Number(internalTemperature).toFixed(2) : "-",
                externalHumidity: externalHumidity ? Number(externalHumidity).toFixed(2) : "-",
                externalTemperature: externalTemperature ? Number(externalTemperature).toFixed(2) : "-"
            }
            setMeasures(measuresFromRemote);

            if(lastPumpStatus == 1) {
                setPumpFlag(true);
            } 
        } catch(err) {
          console.log(err);
        }
    }

    const updateFields = async (fieldNumber) => {
        try {
            const response = await api.get(`${base_channel_url}/fields/${fieldNumber}.json?start=${queryStart}&end=${queryEnd}`);  // 
            const weekFeed = _.get(response, 'data.feeds');
            const weekFeedSlice = _.slice(weekFeed, 50);
            console.log(weekFeedSlice);
            const data = [];
            _.each(weekFeed, (entry, index) => {
                if(isOdd(index)) {
                    const created_at = _.get(entry, 'created_at');
                    const fieldMeasure = _.get(entry, `field${fieldNumber}`);
                    data.push({
                        "x": moment(created_at).format('hh:mm:ss'),
                        "y": fieldMeasure && fieldMeasure !== "nan" ? Number(fieldMeasure).toFixed(2) : 31.8
                    });
                }
            });

            setChartData((chartData) => [...chartData, {
                "id": setMeasureId(fieldNumber),
                "color": setColorId(fieldNumber),
                "data": data
            }]);
        } catch(err) {
            console.log(err);
        }
    }

    useEffect(() => {
        updateDataFromRemote();
        updateFields(4);
        updateFields(6);
    }, []);

    useEffect(() => {
        if(timeLeft === 0){
            setBlockButtonFlag(false);
            setTimeLeft(null);
        }
        if (!timeLeft) return;
        const intervalId = setInterval(() => {
        setTimeLeft(timeLeft - 1);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [timeLeft])
        
    const updatePump = async () => { 
        try{
            const pumpStatusReponse = await api.get(`${bethereUrl}/measures/pumpstatus`);
            setBlockButtonFlag(true);
            const pumpStatus = _.get(pumpStatusReponse, 'data.value');
            if(pumpStatus === "1") {
                await api.post(`${bethereUrl}/send`, {
                    measureName: "Pump Status",
                    value: "0"
                });
                setPumpFlag(false);
            } else {
                await api.post(`${bethereUrl}/send`, {
                    measureName: "Pump Status",
                    value: "1"
                });  
                setPumpFlag(true);
            }
            
            setTimeLeft(11);
        } catch(err) {
          console.log(err);
        }    
    }

    return (
        <div style={{height: "100%"}}>
            <Header title="Dashboard"/>
            <div>
                <span style={{fontSize: "20px"}}>Hello! Your garden looks good today:</span>
                <Cards>
                    <NewCard 
                        label={"Temperature (°C)"} 
                        icon={"thermometer half"} 
                        internalMeasure={measures.internalTemperature} 
                        externalMeasure={measures.externalTemperature} 
                    />
                    <NewCard 
                        label={"Humidity (%)"} 
                        icon={"tint"} 
                        internalMeasure={measures.internalHumidity} 
                        externalMeasure={measures.externalHumidity} 
                    />
                </Cards>
                <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', paddingTop: '20px'}}>
                    <div style={{fontSize: '20px', paddingRight: '20px'}}>
                        Pump
                    </div>
                    <Toggle backgroundColorChecked="#3bea64" disabled={blockButtonFlag} checked={pumpFlag} onChange={() => updatePump()}/>
                    <div style={{marginLeft: '10px'}}>{blockButtonFlag ? `Wait ${timeLeft} seconds to send another command` : "Available!"}</div>
                </div>

                <div style={{width: '85%' , height: '200px'}}>
                    <ResponsiveLine
                        data={chartData}
                        margin={{ top: 10, right: 10, bottom: 50, left: 10 }}
                        xScale={{ type: 'point' }}
                        yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
                        axisTop={null}
                        axisRight={null}
                        axisBottom={{
                            orient: 'bottom',
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 50,
                            legendOffset: 20,
                            legendPosition: 'middle'
                        }}
                        axisLeft={{
                            orient: 'left',
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: 'measure',
                            legendOffset: -40,
                            legendPosition: 'middle'
                        }}
                        colors={{ scheme: 'nivo' }}
                        pointSize={2}
                        pointColor={{ theme: 'background' }}
                        pointBorderWidth={8}
                        pointBorderColor={{ from: 'serieColor' }}
                        pointLabel="y"
                        pointLabelYOffset={-10}
                        useMesh={true}
                        legends={[
                            {
                                anchor: 'top',
                                direction: 'column',
                                justify: false,
                                translateX: 100,
                                translateY: 0,
                                itemsSpacing: 0,
                                itemDirection: 'left-to-right',
                                itemWidth: 80,
                                itemHeight: 20,
                                itemOpacity: 0.75,
                                symbolSize: 12,
                                symbolShape: 'circle',
                                symbolBorderColor: 'rgba(0, 0, 0, .5)',
                                effects: [
                                    {
                                        on: 'hover',
                                        style: {
                                            itemBackground: 'rgba(0, 0, 0, .03)',
                                            itemOpacity: 1
                                        }
                                    }
                                ]
                            }
                        ]}
                    />

                </div>     
            </div>
        </div>
    );
}