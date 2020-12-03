import styled from 'styled-components';
import {rem} from 'polished';

export const Container = styled.div`
    display: flex;
    justify-content: center;
    flex-direction: column;
    text-align: center;
`;

export const ErrorLabel = styled.div`
    color: var(--primary);
    font-size: ${rem('12px')};
    text-align: center;
    padding-top: ${rem('5px')};
`;

export const CustomInput = styled.input`
  text-align: center;
  background-color: var(--white);
  border: ${rem('1px')} solid #ddd;
  border-radius: ${rem('4px')};
  height: 48px;
  padding: 0 ${rem('20px')};
  font-size: ${rem('16px')};
  color: #666;

  ::placeholder {
    text-align: center;
    color: #999;
  }
`;