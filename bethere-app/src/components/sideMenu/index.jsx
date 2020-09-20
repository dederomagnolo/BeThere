import React from 'react';
import { Link } from 'react-router-dom';
import { Col, Row } from 'react-grid-system';
import logo from '../../assets/bethere_logo.png';
import { MenuList, Container } from './styles';

export const SideMenu = () => {
    return(
        <Container style={{ backgroundColor:  '#339999' }}>
            <MenuList style={{color: 'white', boxShadow: '1px 3px 3px gray'}}>
                <Row style={{ height: "100%", color: 'white', fontSize: "30px"}}>
                    <Col xl={12} xs={12} lg={12}>
                        <Row justify="center">
                            <img src={logo} alt="logo" width={200} />
                        </Row>
                    </Col>
                    <Col xl={12} xs={12} lg={12}>
                        <Row justify="center">
                            <Link style={{color: 'white'}} to="/">Dashboard</Link>
                        </Row>
                    </Col>
                    <Col xl={12} xs={12} lg={12}>
                        <Row justify="center">
                            <Link style={{color: 'white'}} to="/charts">Charts</Link>
                        </Row>
                    </Col>
                    <Col xl={12} xs={12} lg={12}>
                        <Row justify="center">
                            <Link style={{color: 'white'}} to="/settings">Settings</Link>
                        </Row>
                    </Col>
                </Row>
            </MenuList>
      </Container>
    );
}