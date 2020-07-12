import React from 'react';
import { Container, Row, Col } from 'react-grid-system';
import { Header } from '../header';
import IOSSwitch from '../switch';

export const Dashboard = () => {

    return (
        <>
            <Header title="Dashboard"/>
            <Container>
                <Col xl={12}>
                    <span style={{fontSize: "20px"}}>Hello!</span>
                </Col>
                <IOSSwitch />
            </Container>
        </>
    );
}