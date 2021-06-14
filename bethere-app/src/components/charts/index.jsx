import React, {useState} from 'react';
import {Container} from 'react-grid-system';
import {Card} from 'semantic-ui-react';

import {Header} from '../header';
import {MenuCard} from '../card';

export const Charts = () => {
    const [moistureChart, setMoistureChart] = useState(false);
    const [temperatureChart, setTemperatureChart] = useState(false);
    const [umidityChart, setUmidityChart] = useState(false);
    const [luminosityChart, setLuminosityChart] = useState(false);
    
    const displayMoistureChart = () => {
        setLuminosityChart(false);
        setUmidityChart(false);
        setTemperatureChart(false);
        setMoistureChart(true);
    }

    const displayTemperatureChart = () => {
        setLuminosityChart(false);
        setUmidityChart(false);
        setMoistureChart(false);
        setTemperatureChart(true);
    }

    const displayUmidityChart = () => {
        setTemperatureChart(false);
        setMoistureChart(false);
        setLuminosityChart(false);
        setUmidityChart(true);
    }

    const displayLuminosityChart = () => {
        setUmidityChart(false);
        setTemperatureChart(false);
        setMoistureChart(false);
        setLuminosityChart(true);
    }

    return (
        <>
            <Header title="Charts"/>
            <Container className="content">
                <span style={{fontSize: '20px'}}>Select below the complete chart you want:</span>
                <Card.Group style={{paddingTop: "20px"}} itemsPerRow={4}>
                    <MenuCard iconName="leaf" label="Moisture" onClick={() => displayMoistureChart()}/>
                    <MenuCard iconName="thermometer half" label="Temperature" onClick={() => displayTemperatureChart()}/>
                    <MenuCard iconName="tint" label="Humidity" onClick={() => displayUmidityChart()}/>
                    <MenuCard iconName="sun" label="Luminosity" onClick={() => displayLuminosityChart()}/>
                </Card.Group>
            </Container>
            
            <Container style={{paddingTop: "25px"}}>
                {moistureChart && <div className="graph1-moisture">
                    <iframe 
                        width="450" 
                        height="260" 
                        style={{border: "1px solid #cccccc"}} 
                        src="https://thingspeak.com/channels/695672/charts/1?bgcolor=%23ffffff&color=%23d62020&dynamic=true&results=60&title=Soil+Moisture&type=line"></iframe>
                </div>}
                
                {temperatureChart && <div className="graph2-temperature">
                    <iframe 
                        width="450" 
                        height="260" 
                        style={{border: "1px solid #cccccc"}} 
                        src="https://thingspeak.com/channels/695672/charts/4?bgcolor=%23ffffff&color=%23d62020&dynamic=true&results=60&title=Temperature&type=line"/>
                </div>}
            
                {umidityChart && <div className="graph3-umidity">
                    <iframe 
                        width="450" 
                        height="260" 
                        style={{border: "1px solid #cccccc"}} src="https://thingspeak.com/channels/695672/charts/3?bgcolor=%23ffffff&color=%23d62020&dynamic=true&results=60&title=Relative+Humidity&type=line"/>
                </div>}
            
                {luminosityChart && <div className="graph4-luminosity">
                    <iframe 
                        width="450" 
                        height="260" 
                        style={{border: "1px solid #cccccc"}} 
                        src="https://thingspeak.com/channels/695672/charts/2?bgcolor=%23ffffff&color=%23d62020&dynamic=true&results=60&title=Luminosidade&type=line"/>
                </div>}
            </Container>
        </>
    );
}