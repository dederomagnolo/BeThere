import React from 'react';
import { Card, Icon } from 'semantic-ui-react';
import './styles.css';


export const MenuCard = ({iconName, label, onClick, label2 }) => {
    return (
        <Card 
            color="teal"
            onClick={() => onClick && onClick()}
            className="cardContainer"
        > 
            <div className="cardContent">
                <div className="labelBig">
                </div>
                <div style={{paddingTop: '20px'}}>
                    <Icon name={iconName} />
                </div>
                {label2 && <div style={{fontSize: '15px'}}>
                    {label2}
                </div>}
            </div>
        </Card>
    )
}