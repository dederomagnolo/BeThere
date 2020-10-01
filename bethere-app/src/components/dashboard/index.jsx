import React, { useState, useEffect } from 'react';
import { Container, Col } from 'react-grid-system';
import { Header } from '../header';
import { Card } from 'semantic-ui-react';
import { MenuCard } from '../card';
import Toggle from 'react-styled-toggle';
import api from '../../services';
import * as _ from 'lodash';
import moment from 'moment';
import { ResponsiveLine } from '@nivo/line'; 
import { setColorId, isOdd, setMeasureId } from './utils';

const base_channel_url = "https://api.thingspeak.com/channels/695672"
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
            const lastFeed = await api.get(`${base_channel_url}/feeds/last.json`);
            const pumpField = _.get(lastFeed, 'data.field7');

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

            if(pumpField == 1) {
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
            const feedsResponse = await api.get("https://api.thingspeak.com/channels/695672/feeds/last.json");
            setBlockButtonFlag(true);
            const pumpStatus = _.get(feedsResponse, 'data.field7');
            if(pumpStatus == 1) {
                await api.get(null, {params: {
                    api_key: 'ZY113X3ZSZG96YC8',
                    field7: 0
                } });
                setPumpFlag(false);
            } else {
                await api.get(null, {params: {
                    api_key: 'ZY113X3ZSZG96YC8',
                    field7: 1
                } });   
                setPumpFlag(true);
            }
            
            setTimeLeft(16);
        } catch(err) {
          console.log(err);
        }    
    }

    return (
        <Container style={{height: '100%'}}>
            <Header title="Dashboard"/>
            {console.log(chartData)}
            <Container>
                <Col xl={12}>
                    <span style={{fontSize: "20px"}}>Hello! Your garden looks good today:</span>
                </Col>
                <Card.Group style={{paddingTop: "20px"}} itemsPerRow={4}>
                    <MenuCard iconName="tint" label={`${measures.internalHumidity}`} label2="Internal Humidity"/>
                    <MenuCard iconName="thermometer half" label={`${measures.internalTemperature}`} label2="Internal Temperature"/>
                    <MenuCard iconName="tint" label={`${measures.externalHumidity}`} label2="External Humidity"/>
                    <MenuCard iconName="thermometer half" label={`${measures.externalTemperature}`} label2="External Temperature"/>
                </Card.Group>

                <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', paddingTop: '20px'}}>
                    <div style={{fontSize: '20px', paddingRight: '20px'}}>
                        Pump
                    </div>
                    <Toggle backgroundColorChecked="#3bea64" disabled={blockButtonFlag} checked={pumpFlag} onChange={() => updatePump()}/>
                    <div style={{marginLeft: '10px'}}>{blockButtonFlag ? `Wait ${timeLeft} seconds to send another command` : "Available!"}</div>
                </div>

                <div style={{width: '100%' , height: '300px'}}>
                    <ResponsiveLine
                        data={chartData}
                        margin={{ top: 20, right: 110, bottom: 50, left: 60 }}
                        xScale={{ type: 'point' }}
                        yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
                        axisTop={null}
                        axisRight={null}
                        axisBottom={{
                            orient: 'bottom',
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 40,
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
                                anchor: 'bottom-right',
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
                
            </Container>
        </Container>
    );
}