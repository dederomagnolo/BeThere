import React from 'react';
import './header.css';
import { Col, Row } from 'react-grid-system';
import logo from '../../assets/bethere_logo.png';
import {Link} from 'react-router-dom';

export const Header = () => {

    return (
        <Col className="headerContainer">
            <Row className="header">
                <Col className="headerTitleContainer">
                    <Col lg={1}>
                        <img src={logo} alt="logo" width={200} />
                    </Col>
                </Col>
            </Row>
        </Col>
    );
}

