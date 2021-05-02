import styled from 'styled-components';

export const Options = styled.div`
    .resetOption {
        display: flex;
        flex-direction: column;
    }
`;

export const Section = styled.div`
    border-bottom: solid 1px gray;

    .selectBackLightTime {
        align-items: center;
    }
`

export const Option = styled.div`
    display: flex;
    padding: 20px 0 20px;
    line-height: 30px;
    width: auto;

    .css-g1d714-ValueContainer {
        width: 130px;
        height: 40px;
    }

    .Collapsible {
        width: 100%;
    }
`
export const OptionLabel = styled.div`
    font-size: 20px; 
    padding-right: 10px;
`
export const SubOptionLabel = styled.div`
    font-size: 14px;
    padding-right: 10px;
`

export const Button = styled.button`
    cursor: pointer;
    font-size: 20px;
    text-align: center;
    display: flex;
    justify-content: center;

    background: #ff8181;
    color: white;
    padding: 8px;
    border-radius: 8px;
    width: 90px;
    outline:none;
    transition: 0.1s;
    &:hover{
    background-color: red;
    }

    .loader {
        margin: 0;
    }
`

export const Input = styled.input`
    background-color: white;
    border-radius: 4px;
    border-width: 1px;
    min-height: 38px;
    border-style: solid;
    border-color:hsl(0,0%,80%);
    padding: 2px 8px 2px;
    width: 130px;
`