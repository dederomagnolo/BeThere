import React from 'react';
import { useSelector } from 'react-redux';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import PageContainer from './pageContainer';
import { Container, Wrapper } from './styles';
import { Dashboard } from '../../pages/dashboard';
import { Charts } from '../charts';
import { Settings } from '../../pages/settings';
import Login from '../../pages/login';
import Register from '../../pages/register';
import MenuBar from '../menuBar';
import Header from '../pageHeader';

import {getToken} from '../../store/user/selectors';

const Layout = () => {
  const auth = useSelector(getToken)
  return (
    <Container>
      <Router>
        {auth && <MenuBar />}
        <Wrapper>
          {auth && <Header />}
          <Switch>
            <Route exact path="/login" component={Login}/>
            <Route exact path="/" component={PageContainer(Dashboard)}/>
            <Route exact path="/charts" component={PageContainer(Charts)} />
            <Route exact path="/settings" component={PageContainer(Settings)}/>
            <Route exact path="/hello-there" component={Register}/>
          </Switch>
        </Wrapper>
      </Router>
    </Container>
  );
}

export default Layout;