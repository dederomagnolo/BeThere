import React, { useState, useEffect } from 'react';
import { Container, Col } from 'react-grid-system';
import { Header } from '../header';
import { Card } from 'semantic-ui-react';
import { MenuCard } from '../card';
import Toggle from 'react-styled-toggle';
import api from '../../services';

export const Dashboard = () => {
    const [pumpFlag, setPumpFlag] = useState(null);
    const [lastStatus, setLastStatus] = useState("");

    const updateDataFromRemote = async () => {
        try{
            const pumpStatus = await api.get("https://api.thingspeak.com/channels/695672/feeds/last.json");
            console.log(pumpStatus.data);
            if(pumpStatus.data.field7 == 1) {
                setPumpFlag(true);
            } 
        } catch(err) {
          console.log(err);
        }
    }

    useEffect(() => {
        updateDataFromRemote();
      }, []);

    const updatePump = async () => { 
        try{
            const pumpStatus = await api.get("https://api.thingspeak.com/channels/695672/feeds/last.json");
            if(pumpStatus.data.field7 == 1) {
                const response = await api.get(null, {params: {
                    api_key: 'ZY113X3ZSZG96YC8',
                    field7: 0
                } });
                setPumpFlag(false);
                return response;
            } else {
                const response = await api.get(null, {params: {
                    api_key: 'ZY113X3ZSZG96YC8',
                    field7: 1
                } });
                setPumpFlag(true);
            }
        } catch(err) {
          console.log(err);
        }    
    }

    return (
        <>
            <Header title="Dashboard"/>
            <Container>
                <Col xl={12}>
                    <span style={{fontSize: "20px"}}>Hello! You garden looks good today:</span>
                </Col>
                <Card.Group style={{paddingTop: "20px"}} itemsPerRow={4}>
                    <MenuCard iconName="thermometer half" label="28° C" label2="Temperature 1"/>
                    <MenuCard iconName="thermometer half" label="30° C" label2="Temperature 2"/>
                    <MenuCard iconName="tint" label="34%" label2="Humidity"/>
                </Card.Group>

                <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', paddingTop: '20px'}}>
                    <div style={{fontSize: '20px', paddingRight: '20px'}}>
                        Pump
                    </div>
                    <Toggle backgroundColorChecked="#3bea64" checked={pumpFlag} onChange={() => updatePump()}/>
                </div>
            </Container>
        </>
    );
}