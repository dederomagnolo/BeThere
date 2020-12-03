import React, {useEffect, useState} from 'react';
import * as _ from 'lodash';
import '../styles.css';
import { Container, Row, Col} from 'react-grid-system';
import { Header } from '../header';
import { Card, Button } from 'semantic-ui-react';
import Toggle from 'react-styled-toggle';
import api from '../../services';

const base_channel_url = "https://api.thingspeak.com/channels/695672"
// const bethereUrl = "https://bethere-be.herokuapp.com";
const bethereUrl = "http://localhost:8080";

export const Settings = () => {
    const [backlightStatus, setBacklightStatus] = useState(false);
    const [showTemperature, setShowTemperature] = useState(false);
    const [showMoisture, setShowMoisture] = useState(false);

    const handleSendCommand = async () => {
        try {
            const backlightStatus = await api.get(`${bethereUrl}/commands/backlight`);
            const status = _.get(backlightStatus, 'data.value');
            const send = status === "1" ? "0" : "1";
            await api.post(`${bethereUrl}/send`, {
                commandName: "Backlight",
                changedFrom: "App",
                value: send
            });

        } catch(err) {
            console.log(err);
        }
    }

    useEffect(() => {
        const fetchBacklight = async () => {
            return await api.get(`${bethereUrl}/commands/backlight`);
        }
        try {
            const res = fetchBacklight();
            const backlightStatusValue = _.get(res, 'data.value');
            setBacklightStatus(backlightStatusValue);
        } catch(err) {
            console.log(err);
        }
    }, []);

    return (
        <>  
            <Header title="Settings"/>
                <Container className="content" style={{paddingTop: "20px", paddingBottom: "20px", maxWidth: "536px"}}>
                    Backlight <Toggle checked={backlightStatus} onChange={() => handleSendCommand()}/>
                </Container>
        </>         
    );
}