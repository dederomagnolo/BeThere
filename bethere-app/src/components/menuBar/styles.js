import styled from 'styled-components';
import { NavLink } from 'react-router-dom';

export const Container = styled.div`
  background: var(--tertiary);
  width: 276px;
  height: 100%;

  @media screen and (max-width: 425px){
    position: fixed;
    width: 100%;
    height: 60px;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    border-top: 1px solid #e3e3e3;
    z-index: 100;
  }
`;

export const Logo = styled.div`
  height: 216px;

  display: flex;
  justify-content: center;
  align-items: center;

  img {
    height: 100px;
  }
  @media screen and (max-width: 425px){
    display: none;
  }
`;
export const MenuList = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-right: 34px;
  z-index: 100;

  @media screen and (max-width: 425px){
    flex-direction: row;
    margin-right: 0;
    height: 100%;
    width: 100%;
    justify-content: center;
  }
`;

export const MenuItem = styled(NavLink)`
  color: var(--white);
  font-size: 14px;
  text-decoration: none;
  font-weight: normal;

  border-radius: 0px 50px 50px 0px;
  width: 100%;
  padding: 10px 10px 10px 33px;
  margin-bottom: 5px;

  display: flex;
  align-items: center;  
  
  transition: all .3s ease-out;
  background: linear-gradient(to right, var(--white-twenty-opacity) 50%, var(--tertiary) 50%);
  background-size: 200% 100%;
  background-position: right bottom;
  :hover {
    background-position: left bottom;
  }
  &.selectedItem {
    background: linear-gradient(to right, var(--white-twenty-opacity) 50%, var(--white-twenty-opacity) 50%);
    font-weight: 600;
  }
  svg {
    width: 24px;
    height: 24px;
    margin-right: 22px;
    stroke: var(--white);
  }

  @media screen and (max-width: 425px){
    flex-direction: column;
    justify-content: center;
    padding: 5px;
    margin-bottom: 0;
    border-radius: 0;
    font-size: 12px;
    background: linear-gradient(to right, var(--white-twenty-opacity) 50%, var(--secondary) 50%);
    background-size: 200% 100%;
    background-position: right bottom;
    height: 100%;
    justify-content: flex-end;
    color: var(--tertiary);
    svg {
      stroke: var(--tertiary);
    }
    :hover {
      background-position: left bottom;
    }
    &.selectedItem {
      background: linear-gradient(to right, var(--white-twenty-opacity) 50%, var(--white-twenty-opacity) 50%);
      font-weight: 600;
      color: var(--white);
      svg {
        stroke: var(--white);
      }
    }

    svg {
      width: 22px;
      height: 22px;
      margin-right: 0;
    }
  }
`;