import styled from 'styled-components';
import {Bell} from 'styled-icons/heroicons-outline';
import {ArrowIosDownwardOutline} from 'styled-icons/evaicons-outline'

export const Container = styled.div`
  background: var(--secondary);
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 63px;
  padding-top: 33px;
  margin-bottom: 40px;

  @media screen and (max-width: 425px){
    justify-content: center;
    margin-bottom: 50px;
    padding-right: 0;
  }
`;
export const AlertIcon = styled(Bell)`
  stroke: var(--black);
  width: 24px;
  height: 24px;
`;

export const ProfilePicture = styled.div`
  margin: 0 5px;
  flex-shrink: 0;

  img {
    height: 35px;
    border-radius: 50px;
  }
`;

export const DropMenu = styled(ArrowIosDownwardOutline)`
  stroke: var(--black);
  width: 24px;
  height: 24px;
`;

export const UserName = styled.div`
  p {
    font-size: 14px;
  }
`;

export const LogOutIcon = styled.img`
  height: 20px;
  width: 20px;
  margin-left: 10px;
  cursor: pointer;
`

