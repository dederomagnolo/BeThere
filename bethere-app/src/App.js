import React from 'react';
import './App.css';
import { BrowserRouter, Switch , Route, Link } from 'react-router-dom';
import { Col, Row } from 'react-grid-system';
import { Header } from './components/header';
import { Home } from './components/home';
import { Settings } from './components/settings';
import { Dashboard } from './components/dashboard';
import { Charts } from './components/charts';

function App() {
  return (
    <BrowserRouter>
     <Header />
     <Row>
       <Col>
       Teste
       </Col>
     </Row>
      <div>
          <Link to="/">Dashboard</Link>


          <Link to="/charts">Charts</Link>


          <Link to="/Settings">Settings</Link>

      </div>
     
      <Switch>
        <Route exact path="/" component={Dashboard} />
        <Route path="/charts" component={Charts} />
        <Route path="/settings" component={Settings} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;

