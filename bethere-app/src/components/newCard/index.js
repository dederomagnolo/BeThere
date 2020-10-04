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

export const NewCard = ({label, icon, internalMeasure, externalMeasure}) => {

    return(
        <CardContainer>
            <InnerCard>
                <CardLabel>
                    <Icon name={icon}/>
                    <div>{label}</div>
                </CardLabel>
                <CardContent>
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
                </CardContent>
            </InnerCard>
        </CardContainer>
    );
}