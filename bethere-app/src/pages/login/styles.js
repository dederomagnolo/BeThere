import styled from 'styled-components';
import {rem} from 'polished';

export const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  flex-direction: row;

  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; } 
  }

  animation: fadeIn 0.5s ease-in-out;
`;

export const Form = styled.form`
  background-color: --white;
  padding-top: ${rem('15px')};
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
`;

export const Input = styled.input`
  background-color: var(--white);
  border: 1px solid #ddd;
  border-radius: 4px;
  height: 48px;
  padding: 0 ${rem('20px')};
  font-size: ${rem('16px')};
  color: #666;
  margin-top: ${('10px')};
  text-align: center;

  ::placeholder {
    text-align: center;
    color: #999;
  }
`;

export const Logo = styled.div`
  align-items: center; 
  justify-content: center; 
  width: 100%; 
  display: flex; 
  flex-direction: column;
  
  img {
    max-height: 250px;
    max-width: 250px;

    @media screen and (max-width: 425px){
      height: 150px;
    }
  }
`;

export const Button = styled.button`
  margin-top: ${rem('50px')};
  margin-bottom: ${rem('50px')};
  width: 100%;
  border: 2px solid #FFF;
  border-radius: 4px;
  height: 48px;
  font-size: 16px;
  background: transparent;
  font-weight: bold;
  color: #FFF;
  cursor: ${(props) => props.disabled ? 'not-allowed' : 'pointer' } ;
  transition: 0.3s;
  
  &:hover{
    background-color: var(--white);
    border: 2px solid var(--blue-forty-five-opacity);
    color: #1491a8d6;
  }
  &:active{
    background-color: var(--blue-forty-five-opacity);
  }
`;

export const ButtonsContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
`

export const FirstAccessLink = styled.div`
  color: var(--white);
  font-size: ${rem('18px')};
  cursor: pointer;
  transition: 0.3s;
  
  &:hover{
    font-weight: bold;
  }
`

export const InnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 400px;
  height: 500px;
  border-radius: 10px;
  background-color: #1491a8d6;
  box-shadow: 1px 1px 8px #1491a8d6;

  @media screen and (max-width: 425px){
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100%;
    width: 100%;
    border-radius: 0;
  }
`