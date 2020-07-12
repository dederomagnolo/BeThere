import React, {useState} from 'react';
import './styles.css';
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
            <Container className="content">
                <Row>
                    <Col xl={12} xs={12} style={{paddingTop: "20px", paddingBottom: "20px"}}>
                        <span style={{fontSize: "20px"}}>Operation Mode</span>
                        <Row style={{paddingTop: '30px', paddingLeft: '20px'}}>
                            <Card.Group itemsPerRow={3}>
                                <MenuCard iconName="clock" label="Timer" onClick={() => displayTimer()}/>
                                <MenuCard iconName="tint" label="Moisture" onClick={() => displayMoisture()}/>
                                <MenuCard iconName="thermometer half" label="Temperature" onClick={() => displayTemperature()}/>
                            </Card.Group>
                        </Row>
                    </Col>
                </Row>
                {showTimer && <Row className="content">
                    <Col xl={12} xs={12} style={{fontSize: "20px", paddingTop: "20px"}}>
                        Timer Settings
                    </Col>
                    <Col xl={12} style={{paddingTop: "20px", paddingBottom: "20px"}}>
                        With this mode, Be There will work considering the time set to turn on your pump. Set below:
                    </Col>
                    <Col xl={12}>
                        <Button color="blue" circular>6h</Button>
                        <Button circular>8h</Button>
                        <Button circular>12h</Button>
                        <Button circular>24h</Button>
                    </Col>
                </Row>}

                {showMoisture && <Row className="content">
                    <Col xl={12} xs={12} style={{fontSize: "20px", paddingTop: "20px"}}>
                        Moisture Settings
                    </Col>
                    <Col xl={12} style={{paddingTop: "20px", paddingBottom: "20px"}}>
                        With this mode, Be There will turn on your pump when the moisture sensor reaches the set point. Set below:
                    </Col>
                </Row>}

                {showTemperature && <Row className="content">
                    <Col xl={12} xs={12} style={{fontSize: "20px", paddingTop: "20px"}}>
                        Temperature Settings
                    </Col>
                    <Col xl={12} style={{paddingTop: "20px", paddingBottom: "20px"}}>
                        With this mode, Be There will turn on your pump when the temperature sensor reaches the set point. Set below:
                    </Col>
                </Row>}

            </Container>
        </>
            
            
        
    );
}