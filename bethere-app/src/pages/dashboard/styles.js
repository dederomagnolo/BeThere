import styled from 'styled-components';

export const Cards = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;

    @media screen and (max-width: 425px){
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
`

export const MainContainer = styled.div`
    padding-left: 15px;
    height: 100%;
`

export const GraphContainer = styled.div`
    padding-top: 10px;
    height: 300px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;

    @media screen and (max-width: 425px){
        width: 100%;
    }
`

export const DateContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 15px;

    .DayPickerInput {
        margin-top: 0 !important;
        font-size: 20px !important;
    }

    input {
        text-align: center;
    }
`