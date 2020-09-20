import React, {useState} from 'react';
import '../styles.css';
import { Container, Row, Col} from 'react-grid-system';
import { Header } from '../header';
import { Card, Button } from 'semantic-ui-react';
import { MenuCard } from '../card';


export const Settings = () => {
    const [showTimer, setShowTimer] = useState(false);
    const [showTemperature, setShowTemperature] = useState(false);
    const [showMoisture, setShowMoisture] = useState(false);

    const displayTimer = () => {
        setShowTemperature(false);
        setShowMoisture(false);
        setShowTimer(true);
    }

    const displayMoisture = () => {
        setShowTemperature(false);
        setShowTimer(false);
        setShowMoisture(true);
    }

    const displayTemperature = () => {
        setShowMoisture(false);
        setShowTimer(false);
        setShowTemperature(true);
    }

    return (
        <>  
            <Header title="Settings"/>
                <Container className="content" style={{paddingTop: "20px", paddingBottom: "20px", maxWidth: "536px"}}>
                    <span style={{fontSize: "20px"}}>Operation Mode</span>
                        <div style={{paddingTop: '20px'}}>
                            <Card.Group itemsPerRow={3}>
                                <MenuCard iconName="clock" label="Timer" onClick={() => displayTimer()}/>
                                <MenuCard iconName="leaf" label="Moisture" onClick={() => displayMoisture()}/>
                                <MenuCard iconName="thermometer half" label="Temperature" onClick={() => displayTemperature()}/>
                            </Card.Group>
                        </div>

                        {showTimer && 
                            <div className="content">
                                <div style={{fontSize: "20px", paddingTop: "20px", paddingLeft: "0 !important"}}>
                                    Timer Settings
                                </div>
                                <div style={{paddingTop: "20px", paddingBottom: "20px"}}>
                                    BeThere will work considering to turn on your pump. Set below:
                                </div>
                                <div>
                                    <Button color="blue" circular>6h</Button>
                                    <Button circular>8h</Button>
                                    <Button circular>12h</Button>
                                    <Button circular>24h</Button>
                                </div>
                            </div>}

                        {showMoisture && <div className="content">
                            <div style={{fontSize: "20px", paddingTop: "20px"}}>
                                Moisture Settings
                            </div>
                            <div style={{paddingTop: "20px", paddingBottom: "20px"}}>
                                BeThere will turn on your pump when the moisture sensor reaches the set point. Set below:
                            </div>
                        </div>}


                        {showTemperature && <div className="content">
                            <div xl={12} xs={12} style={{fontSize: "20px", paddingTop: "20px"}}>
                                Temperature Settings
                            </div>
                            <div xl={12} style={{paddingTop: "20px", paddingBottom: "20px"}}>
                                BeThere will turn on your pump when the temperature sensor reaches the set point. Set below:
                            </div>
                        </div>}
                </Container>
        </>         
    );
}