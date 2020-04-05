import React from 'react';
import './header.css';
import { Col, Row } from 'react-grid-system';
import logo from '../../assets/bethere_logo.png'

export const Header = () => {

    return (
        <Col className="headerContainer">
            <Row className="header">
                <Col className="headerTitleContainer">
                    <Col lg={1}>
                        <img src={logo} alt="logo" width={200} />
                    </Col>
                    <Col className="rightHeaderCol">
                        <div className="headerTitle">Dashboard</div>                
                    </Col>
                </Col>
            </Row>
        </Col>
    );
}

