import styled from 'styled-components';

export const MenuList = styled.div`
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
margin-right: 34px;

@media screen and (max-width: 425px){
  flex-direction: row;
  margin-right: 0;
  height: 100%;
  width: 100%;
  justify-content: center;
}
`;

export const Container = styled.div`
  background: var(--tertiary);
  width: 276px;
  height: 100%;

  @media screen and (max-width: 425px){
    position: fixed;
    width: 100%;
    height: 80px;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    border-top: 1px solid #e3e3e3;
  }
`;