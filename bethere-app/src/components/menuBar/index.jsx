import React from 'react';
import {Home, ChartBar, Adjustments } from '@styled-icons/heroicons-outline';
import { Container, Logo, MenuList, MenuItem } from './styles';
import logo from '../../assets/bethere_logo.png';

const MenuBar = () => {
  const menuArray = [
    {
      Icon: () => <Home />,
      text: 'Dashboard',
      path: '/'
    }
    /* {
      Icon: () => <ChartBar />,
      text: 'Charts',
      path: '/charts'
    },
    {
      Icon: () => <Adjustments />,
      text: 'Settings',
      path: '/settings'
    } */
  ]
  return (
    <Container>
      <Logo>
        <img src={logo} alt=""/>
      </Logo>
      <MenuList>
        {menuArray.map(({Icon, path, text}) => 
          <MenuItem exact activeClassName="selectedItem" to={path}>
            <Icon />
            {text}
          </MenuItem>
        )}
      </MenuList>
    </Container>
  );
}

export default MenuBar;