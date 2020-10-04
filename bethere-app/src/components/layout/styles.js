import styled from 'styled-components';

export const Container = styled.div`
  background: var(--secondary);

  display: flex;
  flex-direction: row;
  height: 100%;
`;

export const Wrapper = styled.div `
  height: 100%;
  width: 100%;

  display: flex;
  flex-direction: column;
  overflow: auto;

  @media screen and (max-width: 425px){ 
    height: calc(100vh - 60px);
  }
`;