import styled from 'styled-components';

export const Options = styled.div`
    .resetOption {
        display: flex;
        flex-direction: column;
    }
`;

export const CollapsibleHeader = styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
`

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

export const SubOption = styled(Option)`
    align-items: center;
    margin-left: 10px;

    .secondSubOption {
        margin-left: 10px;
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
export const WateringParametersContainer = styled.div`
    @keyframes fadeIn {
        0% { opacity: 0; }
        100% { opacity: 1; } 
    }

    animation: fadeIn 0.5s ease-in-out;
`

export const EditLabel = styled.span`
    text-decoration: none;
    display: inline-block;
    margin: 20px auto;
    position: relative;
    overflow: hidden;
    padding: 0 6px;
    transition: color .3s cubic-bezier(0.11, 0.7, 0, 1);
    
    line-height: 1.3;

  
    &:hover{
        cursor: pointer;
        color: var(--tertiary);
    }

    &::after {
        position: absolute;
        bottom: 0;
        left: 0;
        display: inline-block;
        width: 100%;
        height: 2px;
        background-color: var(--tertiary);
        content: "";
        transform: scale(0);
        transition: transform 0.3s cubic-bezier(0.11, 0.7, 0, 1);
    }
  
    &:hover {
        &::after {
            transform: scale(1);

        }
    }
`
export const Button = styled.button`
    cursor: pointer;
    
    text-align: center;
    display: flex;
    justify-content: center;
    background: var(--blue-forty-five-opacity);
    color: white;
    padding: 8px;
    border-radius: 8px;
    width: 120px;
    outline:none;
    transition: 0.1s;
    &:hover{
        background-color: var(--tertiary);
    }

    .loader {
        margin: 0;
    }
`

export const ResetButton = styled(Button)`
    background: #ff8181;
    font-size: 18px;
    &:hover{
        background-color: red;
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