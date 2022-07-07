import React, { useEffect, useState } from "react";
import * as _ from "lodash";
import Toggle from "react-styled-toggle";
import Select from "react-select";
import { useTranslate } from "react-translate";
import {
  SubOption,
  SubOptionLabel,
  Input,
  WateringParametersContainer,
	SuccessButtonContainer
} from "../styles";

import SuccessButton from "../successButton";

const timeOptions = [];
for (let i = 0; i < 24; i++) {
  timeOptions.push({
    value: i,
    label: `${i}h00`,
  });
}

const WateringRoutineOptions = ({
  handleEditRoutine,
  wateringRoutineSettings,
  selectedDeviceSettings,
  deviceId
}) => {
  const [editSuccess, setEditSuccess] = useState(null);
  const translate = useTranslate("settings");
  const [moistureAutomationEnabled, setMoistureAutomationEnabled] = useState(false);
  const wateringRoutineEnabled = _.get(wateringRoutineSettings, "enabled");
  const [routinePayload, setRoutinePayload] = useState({
    enabled: wateringRoutineEnabled,
    startTime: _.get(wateringRoutineSettings, "startTime"),
    endTime: _.get(wateringRoutineSettings, "endTime"),
    interval: _.get(wateringRoutineSettings, "interval"),
    duration: _.get(wateringRoutineSettings, "duration"),
  });

  const findTimeDefaultOption = (value) => {
    return _.find(timeOptions, (option) => option.value === value);
  };

  useEffect(() => {
    const routineSettings = _.get(selectedDeviceSettings, "wateringRoutine");
    setRoutinePayload({ ...routineSettings });
  }, [deviceId])

  return(
    <WateringParametersContainer>
      <SubOption>
        <SubOptionLabel>
          {translate("wateringStartTimeLabel")}:
        </SubOptionLabel>
        <Select
          styles={{
            container: (provided) => ({
              ...provided,
              width: "120px",
            }),
          }}
          onChange={(selected) => {
            setRoutinePayload({
              ...routinePayload,
              startTime: selected.value,
            });
          }}
          defaultValue={findTimeDefaultOption(
            routinePayload.startTime
          )}
          menuPortalTarget={document.querySelector("body")}
          options={timeOptions}
        />
        <SubOptionLabel className="secondSubOption">
          {translate("wateringEndTimeLabel")}:
        </SubOptionLabel>
        <Select
          styles={{
            container: (provided) => ({
              ...provided,
              width: "130px",
            }),
          }}
          onChange={(selected) =>
            setRoutinePayload({
              ...routinePayload,
              endTime: selected.value,
            })
          }
          defaultValue={findTimeDefaultOption(
            routinePayload.endTime
          )}
          menuPortalTarget={document.querySelector("body")}
          options={timeOptions}
        />
      </SubOption>
      <SubOption>
        <SubOptionLabel>
          {translate("wateringIntervalLabel")}:
        </SubOptionLabel>
        <Input
          onChange={(e) =>
            setRoutinePayload({
              ...routinePayload,
              interval: e.target.value,
            })
          }
          value={routinePayload.interval}
          placeholder={"minutes"}
          type="number"
          min={0}
          max={40}
        />
      </SubOption>
      <SubOption>
        <SubOptionLabel>
          {translate("wateringTimerLabel")}:
        </SubOptionLabel>
        <Input
          onChange={(e) =>
            setRoutinePayload({
              ...routinePayload,
              duration: e.target.value,
            })
          }
          value={routinePayload.duration}
          placeholder={"minutes"}
          type="number"
          min={0}
          max={200}
        />
      </SubOption>
      <SubOption>
        <SubOptionLabel>
          Utilizar sensor de umidadde
        </SubOptionLabel>
        <Toggle
          checked={moistureAutomationEnabled}
          onChange={() => {
            setMoistureAutomationEnabled(!moistureAutomationEnabled)
          }} 
        />
      </SubOption>
      <SubOption>
        {moistureAutomationEnabled && (
          <Input
            onChange={(e) =>
              setRoutinePayload({
                ...routinePayload,
                duration: e.target.value,
              })
            }
            value={routinePayload.duration}
            placeholder={"minutes"}
            type="number"
            min={0}
            max={200}
          />
        )}
      </SubOption>
      <SuccessButtonContainer>
        <SuccessButton
          success={editSuccess}
          callBack={setEditSuccess}
          onClick={() =>
            handleEditRoutine(!wateringRoutineEnabled, true)
          }
          buttonLabel={translate("wateringSaveChangesButton")}
          successLabel={translate(
            "wateringSaveChangesSuccessLabel"
          )}
        />
      </SuccessButtonContainer>
    </WateringParametersContainer>
  )
}

export default WateringRoutineOptions;