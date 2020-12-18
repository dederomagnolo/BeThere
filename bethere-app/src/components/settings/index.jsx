import React, {useEffect, useState} from 'react';
import * as _ from 'lodash';
import '../styles.css';
import { Container, Row, Col} from 'react-grid-system';
import { Header } from '../header';
import { Card, Button } from 'semantic-ui-react';
import Toggle from 'react-styled-toggle';
import api from '../../services';
import {bethereUrl} from '../../services/configs';

export const Settings = () => {
    const [backlightStatus, setBacklightStatus] = useState(false);
    const [showTemperature, setShowTemperature] = useState(false);
    const [showMoisture, setShowMoisture] = useState(false);

    const handleSendCommand = async () => {
        try {
            const lastBackLightResponse = await api.post(`${bethereUrl}/commands/laststatus` , {
                commandName: "Backlight"
            });
            const lastStatus = _.get(lastBackLightResponse, 'data.value');

            if(lastStatus === "LCD_ON") {
                const offRes = await api.post(`${bethereUrl}/send`, {
                    commandName: "Backlight",
                    changedFrom: "App",
                    value: "LCD_OFF"
                });

                if(offRes) { 
                    setBacklightStatus(false);
                }
            } else {
                const onRes = await api.post(`${bethereUrl}/send`, {
                    commandName: "Backlight",
                    changedFrom: "App",
                    value: "LCD_ON"
                });

                if(onRes) { 
                    setBacklightStatus(true);
                }
            }
        } catch(err) {
            console.log(err);
        }
    }

    useEffect(() => {
        const fetchBacklight = async () => {
            const res = await api.post(`${bethereUrl}/commands/laststatus` , {
                commandName: "Backlight"
            });
            const backlightStatusValue = _.get(res, 'data.value');
            console.log(res);
            if(backlightStatusValue === "LCD_ON") {
                setBacklightStatus(true);
            } else {
                setBacklightStatus(false);
            }
        }
        fetchBacklight();
    }, []);

    return (
        <>  
            <Header title="Settings"/>
                <Container className="content" style={{paddingTop: "20px", paddingBottom: "20px", maxWidth: "536px", lineHeight: "50px"}}>
                    Backlight 
                    <Toggle 
                        checked={backlightStatus} 
                        onChange={() => handleSendCommand()}
                    />
                </Container>
        </>         
    );
}