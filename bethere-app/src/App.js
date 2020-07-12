import React from 'react';
import './App.css';
import { BrowserRouter, Switch , Route, Link } from 'react-router-dom';
import { Col, Row, Container } from 'react-grid-system';
import { Header } from './components/header';
import { Settings } from './components/settings';
import { Dashboard } from './components/dashboard';
import { Charts } from './components/charts';
import logo from './assets/bethere_logo.png';

function App() {
  return (
    <BrowserRouter>
    <div style={{display: 'flex'}}>
      <Col lg={3} style={{ backgroundColor:  '#339999', height: '100vh' }}>
        <Container style={{height: '100%', color: 'white', boxShadow: '1px 3px 3px gray'}}>
          <Row style={{ height: "100%", color: 'white'}}>
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
        </Container>
      </Col>
      <Col lg={9}>
        <Switch>
          <Route exact path="/" component={Dashboard} />
          <Route path="/charts" component={Charts} />
          <Route path="/settings" component={Settings} />
        </Switch>
      </Col>
    </div>
      
    </BrowserRouter>
  );
}

export default App;

