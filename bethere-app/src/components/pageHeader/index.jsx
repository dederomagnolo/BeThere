import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  getUserInformation,
} from '../../store/user/selectors';
import logOutImage from '../../assets/logout.png';
import { clearUserState } from '../../store/user/actions';
import { clearGlobalState } from '../../store/global/actions';

import {
  Container,
/*   AlertIcon, */
  ProfilePicture,
/*   DropMenu, */
  UserName,
  LogOutIcon
} from './styles';

const Header = () => {
  const dispatch = useDispatch();
  const { firstname, lastname } = useSelector(getUserInformation);

  const handleLogOut = () => {
    dispatch(clearUserState());
    dispatch(clearGlobalState());
  }

  return (
    <Container>
      {/* <AlertIcon /> */}
      {/* <ProfilePicture>
        <img src={} alt="foto do perfil"/>
      </ProfilePicture> */}
      <UserName>
        <p>
          {firstname} {lastname}
        </p>
      </UserName>
      {/* <DropMenu className="dropMenu" /> */}
      <LogOutIcon onClick={() => handleLogOut()} src={logOutImage} alt="Sair" title="Sair"/>
    </Container>
  );
};

export default Header;
