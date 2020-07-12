import React from 'react';
import { Container, Row, Col} from 'react-grid-system';
import { Card, Icon } from 'semantic-ui-react';


export const MenuCard = ({iconName, label, onClick}) => {
    return (
        <Card 
            color="teal"
            onClick={() => onClick && onClick()}
            style={{width: '200px' , height: '200px', display: 'flex', justifyContent: 'center'}}
        > 
            <Row justify="center" style={{textAlign: "center", fontSize: "25px", color: "teal"}}>
                <Col xl={12} xs={12}>
                    <Icon name={iconName} />
                </Col>
                <Col xl={12} xs={12}>
                    {label}
                </Col>
            </Row>
        </Card>
    )
}