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