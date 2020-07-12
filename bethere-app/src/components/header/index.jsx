import React from 'react';
import './header.css';

import { Container, Row } from 'react-grid-system';


export const Header = ({title}) => {
    return (
        <Container>
            <div className="headerTitle">
                {title}
            </div>
        </Container> 
    );
}

