import styled from 'styled-components';

export const CardContainer = styled.div`
  width: 240px;
  height: 130px; 
  box-shadow: 0 0 0 1px #d4d4d5, 0 2px 0 0 #00b5ad, 0 1px 3px 0 #d4d4d5;
  border-radius: 3px;
  background: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 5px;

  @media screen and (max-width: 425px){ 
      width: 100%;
  }
`

export const InnerCard = styled.div`
`

export const CardLabel = styled.div`
  display: flex;
  flex-direction: row;
  font-size: 20px;
  justify-content: center;
  padding-bottom: 10px;
`

export const CardContent = styled.div`
  display: flex;
  justify-content: space-between;
  min-width: 230px;
`

export const CardColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`

export const MeasureContainer = styled.div`
  display: flex;
  flex-direction: row;
  font-size: 25px;
`

export const MeasureLabel = styled.div`
  font-size: 14px;
  padding-bottom: 25px;
`