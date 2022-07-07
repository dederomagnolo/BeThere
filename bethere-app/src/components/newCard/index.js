import React from "react";
import { useTranslate } from "react-translate";
import { Icon } from "semantic-ui-react";
import _ from "lodash";
import {
  CardContainer,
  InnerCard,
  CardLabel,
  CardContent,
  CardColumn,
  MeasureContainer,
  MeasureLabel,
} from "./styles";

export const NewCard = ({
  label,
  icon,
  multipleMeasures,
  pump,
  children,
  onClick,
}) => {
  const internalMeasure = _.get(multipleMeasures, 'internalMeasure');
  const externalMeasure = _.get(multipleMeasures, 'externalMeasure');
  const translate = useTranslate("home");
  const renderMultipleLabels = () => {
    return (
      <>
        <CardColumn>
          <MeasureLabel>{translate("internalLabel")}</MeasureLabel>
          <MeasureContainer>
            <div>{internalMeasure}</div>
          </MeasureContainer>
        </CardColumn>
        <CardColumn>
          <MeasureLabel>{translate("externalLabel")}</MeasureLabel>
          <MeasureContainer>
            <div>{externalMeasure}</div>
          </MeasureContainer>
        </CardColumn>
      </>
    )
  }

  const renderCardContent = () => {
    if(pump) {
      return <CardColumn>{children}</CardColumn>;
    }

    if(multipleMeasures) {
      return renderMultipleLabels()
    }

    return (
      <CardColumn>
        <MeasureContainer>
          <div>{externalMeasure}</div>
        </MeasureContainer>
      </CardColumn>
    )
  }

  return (
    <CardContainer onClick={() => onClick && onClick()}>
      <InnerCard>
        <CardLabel>
          <Icon name={icon} />
          <div>{label}</div>
        </CardLabel>
        <CardContent>
          {renderCardContent()}
        </CardContent>
      </InnerCard>
    </CardContainer>
  );
};
