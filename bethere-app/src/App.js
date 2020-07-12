import React, { useState } from 'react';
import './App.css';
import { BrowserRouter, Switch , Route, Link, useHistory} from 'react-router-dom';
import { Col, Row, Container } from 'react-grid-system';
import { Settings } from './components/settings';
import { Dashboard } from './components/dashboard';
import { Charts } from './components/charts';
import { SideMenu } from './components/sideMenu';
import { Menu } from 'semantic-ui-react';
import logo from './assets/bethere_logo.png';

function App() {
  const [activeItem, setActiveItem] = useState("Dashboard");

  const handleItemClick = (e, {name}) => {
    console.log(name);
    setActiveItem(name);
  }

  console.log(activeItem === 'Dashboard');

  return (
    <BrowserRouter>
    <div style={{display: 'flex', height: '100vh' }}>
      {/* <SideMenu /> */}
      <Menu pointing vertical color="teal">
        <Col xl={12} xs={12} lg={12}>
            <div style={{backgroundColor: '#339999'}}>
                <img src={logo} alt="logo" width={200} />
            </div>
        </Col>
        <Menu.Item
          as={Link} to="/"
          name='Dashboard'
          active={activeItem === 'Dashboard'}
          onClick={handleItemClick}
        />
        <Menu.Item
          as={Link} to="/charts"
          name='Charts'
          active={activeItem === 'Charts'}
          onClick={handleItemClick}
        />
        <Menu.Item
           as={Link} to="/settings"
          name='Settings'
          active={activeItem === 'Settings'}
          onClick={handleItemClick}
        />
      </Menu>
      <Col lg={9} style={{padding: "0 30px 0"}}>
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

