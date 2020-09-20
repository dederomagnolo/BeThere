import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

import { Container, Wrapper } from './styles';
import { Dashboard } from '../dashboard';
import { Charts } from '../charts';
import { Settings } from '../settings';
import MenuBar from '../menuBar';

const Layout = () => {
  return (
    <Container>
      <Router>
        <MenuBar />
        <Wrapper>
          <Switch>
            <Route exact path="/" component={Dashboard}/>
            <Route exact path="/charts" component={Charts} />
            <Route exact path="/settings" component={Settings}/>
          </Switch>
        </Wrapper>
      </Router>
    </Container>
  );
}

export default Layout;