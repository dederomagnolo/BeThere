import React from 'react';
import { 
    CardContainer, 
    InnerCard, 
    CardLabel, 
    CardContent, 
    CardColumn, 
    MeasureContainer,
    MeasureLabel
} from './styles';
import { Icon } from 'semantic-ui-react';

export const NewCard = ({label, icon, internalMeasure, externalMeasure, pump, children, onClick}) => {

    return(
        <CardContainer onClick={() => onClick && onClick()}>
            <InnerCard>
                <CardLabel>
                    <Icon name={icon}/>
                    <div>{label}</div>
                </CardLabel>
                <CardContent>
                    {!pump ? 
                        <>
                            <CardColumn>
                                <MeasureLabel>Internal</MeasureLabel>
                                <MeasureContainer>
                                    <div>{internalMeasure}</div>
                                </MeasureContainer>
                            </CardColumn>
                            <CardColumn>
                                <MeasureLabel>External</MeasureLabel>
                                <MeasureContainer>
                                    <div>{externalMeasure}</div>
                                </MeasureContainer>
                            </CardColumn>
                        </> : <CardColumn>{children}</CardColumn>}
                </CardContent>
            </InnerCard>
        </CardContainer>
    );
}