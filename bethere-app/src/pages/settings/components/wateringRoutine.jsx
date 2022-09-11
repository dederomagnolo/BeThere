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
  selectedDeviceSettings,
  deviceId,
  routinePayload,
  setRoutinePayload,
  selectedDevice,
  sendCommand,
  userId
}) => {
  const [editSuccess, setEditSuccess] = useState(null);
  const translate = useTranslate("settings");
  const wateringRoutineSettings = _.get(selectedDeviceSettings, "wateringRoutine");
  const wateringRoutineEnabled = _.get(wateringRoutineSettings, "enabled");
  const selectedDeviceAddons = _.get(selectedDevice, "addons");
  const [showMoistureOptions, setShowMoistureOptions] = useState(_.get(selectedDeviceSettings, "moistureSensor.enabled"));
  const isMoistureSensor = _.find(selectedDeviceAddons, (addon) => {
    return addon && addon.characteristics && addon.characteristics.model === 'HD38'
  })

  const findTimeDefaultOption = (value) => {
    return _.find(timeOptions, (option) => option.value === value);
  };

  const handleMoistureAutomation = async () => {
    await sendCommand("MOISTURE_AUTO_ON", userId, deviceId);
    setShowMoistureOptions(!showMoistureOptions);
    await handleEditRoutine({
      wateringRoutineEnabledState: !wateringRoutineEnabled,
      routinePayload,
      successCallback: setEditSuccess,
      editAutoMoisture: true
    })
  }

  return(
    <WateringParametersContainer>
      {!showMoistureOptions && <SubOption>
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
      </SubOption>}
      {!showMoistureOptions && <SubOption>
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
      </SubOption>}
      {!showMoistureOptions && <SubOption>
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
      </SubOption>}
      {isMoistureSensor && (
        <SubOption>
          <SubOptionLabel>
            {translate("enableMoistureSensorLabel")}
          </SubOptionLabel>
          <Toggle
            backgroundColorChecked="#3bea64"
            checked={showMoistureOptions}
            onChange={() => handleMoistureAutomation()} 
          />
        </SubOption>
      )}
      {showMoistureOptions && (
        <SubOption>
          <SubOptionLabel>
            {translate("moistureSensorSetPointLabel")}:
          </SubOptionLabel>
          <Input
            onChange={(e) =>
              setRoutinePayload({
                ...routinePayload,
                moistureSensorSetPoint: e.target.value,
              })
            }
            value={routinePayload.moistureSensorSetPoint}
            placeholder={"minutes"}
            type="number"
            min={0}
            max={1024}
          />
        </SubOption>
      )}
      <SuccessButtonContainer>
        <SuccessButton
          success={editSuccess}
          callBack={setEditSuccess}
          onClick={() =>
            handleEditRoutine({
              wateringRoutineEnabledState: !wateringRoutineEnabled,
              editFromButton: true,
              routinePayload,
              successCallback: setEditSuccess
            })
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