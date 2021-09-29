import styled from 'styled-components'

export const InnerContent = styled.div`
    display: flex;
`

export const CommandsList = styled.div`
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    width: 100%;
    margin-top: 10px;
`

export const CommandLabels = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 80%;
`

export const CommandCard = styled.div`
    height: 70px;
    background-color: #FFF;
    margin: 4px 0 4px;
    width: 350px;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    padding: 8px;
    box-shadow:0 1px 3px rgba(0,0,0,0.2), 0 3px 5px rgba(0,0,0,0.1);
`

export const Label = styled.div`
    font-size: 14px;
`

export const CommandCategory = styled(Label)`
    font-weight: bold;
`

export const GreenLabel = styled(Label)`
    color: green;
`

export const RedLabel = styled(Label)`
    color: red;
`

export const BlueLabel = styled(Label)`
    color: #1491a869
`

