import React, { useEffect, useState } from "react";
import Toggle from "react-styled-toggle";
import * as _ from "lodash";
import Select from "react-select";
import { useTranslate } from "react-translate";
import { useSelector, useDispatch } from "react-redux";
import { ArrowIosDownwardOutline } from "@styled-icons/evaicons-outline/ArrowIosDownwardOutline";
import { ArrowIosUpwardOutline } from "@styled-icons/evaicons-outline/ArrowIosUpwardOutline";
import { Container } from "react-grid-system";
import Collapsible from "react-collapsible";
import "../../styles/styles.css";
import api from "../../services";
import { bethereUrl } from "../../services/configs";
import { Header } from "../../components/header";
import {
  Option,
  OptionLabel,
  Options,
  SubOption,
  SubOptionLabel,
  Section,
  Input,
  CollapsibleHeader,
  EditLabel,
  WateringParametersContainer,
  Disclaimer,
  SubOptionContainer,
	SuccessButtonContainer
} from "./styles";
import ResetOption from "./reset";
import WateringRoutineOptions from "./components/wateringRoutine";
import { getUserDevices, getUserId } from "../../store/user/selectors";
import { updateDeviceSettings } from "../../store/user/actions";
import { setUserDevices } from "../../store/devices/actions";
import sendCommand from "../../services/sendCommand";
import {
  minutesToMilliseconds,
  secondsToMilliseconds,
	getDeviceSettings,
	getDeviceOptionsToSelect
} from "../../utils/functions";
import SuccessButton from "./successButton";

export const Settings = () => {
	const translate = useTranslate("settings");
	const dispatch = useDispatch();
  const userDevices = useSelector(getUserDevices);
  const userId = useSelector(getUserId);
	const [loading, setLoading] = useState(false);
	const [editManualTimer, setEditManualTimer] = useState(null);
	const [editSuccess, setEditSuccess] = useState(null);
  
  const [selectedDevice, setSelectedDevice] = useState(
    _.get(userDevices, "[0]")
  );

  const deviceId = _.get(selectedDevice, '_id');
	const [deviceSettings, setDeviceSettings] = useState(_.get(userDevices, '[0].settings[0]'));

  const wateringRoutineSettings = _.get(deviceSettings, "wateringRoutine");
	const manualTimerFromRemote = _.get(deviceSettings, "pumpTimer");
  const moistureSensorSettings = _.get(deviceSettings, "moistureSensor");

  const wateringRoutineEnabled = _.get(wateringRoutineSettings, "enabled");
  const moistureAutomationEnabled = _.get(moistureSensorSettings, "enabled");

  const [showWorkingRoutineOptions, setShowWorkingRoutineOptions] = useState(
    wateringRoutineEnabled
  );
  const [routinePayload, setRoutinePayload] = useState({
    enabled: wateringRoutineEnabled,
    moistureAutomationEnabled,
    startTime: _.get(wateringRoutineSettings, "startTime"),
    endTime: _.get(wateringRoutineSettings, "endTime"),
    interval: _.get(wateringRoutineSettings, "interval"),
    duration: _.get(wateringRoutineSettings, "duration"),
    moistureSensorSetPoint: _.get(moistureSensorSettings, "setPoint")
  });

	const [manualTimer, setManualTimer] = useState(manualTimerFromRemote);

  const handleEditRoutine = async (options = {
    wateringRoutineEnabledState: false,
    editFromButton: false,
		editManualPumpTimer: false,
    editAutoMoisture: false
  }) => {
    const {
      wateringRoutineEnabledState,
      editFromButton,
      editManualPumpTimer,
      editAutoMoisture
    } = options;

    try {
      setLoading(true);
      const {
        localMeasureInterval,
        remoteMeasureInterval,
        pumpTimer,
      } = deviceSettings;

      const {
				startTime, 
				endTime, 
				interval, 
				duration,
        backlight,
        moistureSensorSetPoint
			} = routinePayload;

			const pumpTimerToSend = editManualPumpTimer ? manualTimer : pumpTimer;

			const payload = {
				userId,
				deviceId,
				settingsId: _.get(deviceSettings, "_id"),
				localMeasureInterval,
				remoteMeasureInterval,
				pumpTimer: pumpTimerToSend,
				backlight,
				wateringRoutine: {
					startTime: startTime,
					endTime: endTime,
					interval: interval,
					duration: duration,
					enabled: editManualPumpTimer ? wateringRoutineEnabledState : !wateringRoutineEnabledState
				},
        moistureSensor: {
          enabled: editAutoMoisture ? !moistureAutomationEnabled : moistureAutomationEnabled,
          setPoint: moistureSensorSetPoint
        }
			}

      const editSettingsResponse = await api.post(
        `${bethereUrl}/settings/edit`,
        payload
      );

      if (editManualPumpTimer || !wateringRoutineEnabledState) {
        await sendCommand(
          "SETTINGS",
          userId,
          deviceId,
          `${backlight},${minutesToMilliseconds(
            pumpTimerToSend
          )},${secondsToMilliseconds(
            localMeasureInterval
          )},${minutesToMilliseconds(
            remoteMeasureInterval
          )},${startTime},${endTime},${minutesToMilliseconds(
            duration
          )},${minutesToMilliseconds(interval)},${moistureSensorSetPoint}`
        );
      }

      if (editSettingsResponse) {
        const res = await api.post(`${bethereUrl}/settings`, {
          deviceId: deviceId,
        });
        const successCallback = _.get(options, 'successCallback');
        const deviceUpdatedSettings = _.get(res, "data.settingsFromDevice");
        console.log({deviceUpdatedSettings})
        setDeviceSettings(deviceUpdatedSettings[0]);
        dispatch(updateDeviceSettings({ selectedDevice: deviceId, deviceUpdatedSettings }));
        if (editFromButton) {
          setTimeout(() => {
            setEditSuccess(true);
            successCallback && successCallback(true);
          }, 300);
          setTimeout(() => {
            setEditSuccess(false);
            successCallback && successCallback(false);
          }, 3000);
        }
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  const handleTurnOffWateringMode = async () => {
    try {
      await sendCommand("WATERING_AUTO_OFF", userId, deviceId);
      await handleEditRoutine({ wateringRoutineEnabledState: true });
    } catch (err) {
      console.log(err);
    }
  };

  const handleTurnOnWateringMode = async () => {
    try {
      await sendCommand("WATERING_AUTO_ON", userId, deviceId);
      await handleEditRoutine();
    } catch (err) {
      console.log(err);
    }
  };

  const handleSetSelectedDevice = (selected) => {
    const device = _.find(
      userDevices,
      (device) => selected.value === device._id
    );
    setSelectedDevice(device);
  };

  useEffect(() => {
    const selectedDeviceSettings = getDeviceSettings(userDevices, deviceId);
    setDeviceSettings(selectedDeviceSettings);
  }, [deviceId]);

  useEffect(() => {
    const fetchUserDevices = async () => {
      const res = await api.post(`${bethereUrl}/devices/user-devices`, {
        userId,
      });
      const userDevices = _.get(res, "data");
      dispatch(setUserDevices(userDevices));
    };
    fetchUserDevices();
  }, []);

  const renderCollapsibleTitle = (title, whenOpen) => {
    return (
      <CollapsibleHeader>
        <OptionLabel>{title}</OptionLabel>
        {whenOpen ? (
          <ArrowIosUpwardOutline size={20} />
        ) : (
          <ArrowIosDownwardOutline size={20} />
        )}
      </CollapsibleHeader>
    );
  };

  return (
    <Container className="settings" style={{ height: "100%", minWidth: "80%" }}>
      <Header title={translate("title")} />
      <div>
        <OptionLabel>{translate("selectDeviceLabel")}</OptionLabel>
        <Select
          isSearchable={false}
          styles={{
            container: (provided) => ({
              ...provided,
              marginTop: "15px",
              width: "300px",
            }),
          }}
          defaultValue={_.get(getDeviceOptionsToSelect(userDevices), '[0]')}
          onChange={handleSetSelectedDevice}
          options={getDeviceOptionsToSelect(userDevices)}
        />
        <Disclaimer>{translate("defaultDeviceDisclaimer")}</Disclaimer>
      </div>
      {deviceSettings ? (
        <Options>
          <Section>
            <Option>
              <Collapsible
                trigger={renderCollapsibleTitle(translate("wateringLabel"))}
                triggerWhenOpen={renderCollapsibleTitle(
                  translate("wateringLabel"),
                  true
                )}
                transitionTime={150}
              >
                <SubOptionContainer>
                  <div style={{ display: "flex" }}>
                    <SubOptionLabel>
                      {translate("autoWateringLabel")}
                    </SubOptionLabel>
                    <Toggle
                      name="autoWatering"
                      backgroundColorChecked="#3bea64"
                      disabled={loading}
                      checked={wateringRoutineEnabled}
                      onChange={() => {
                        wateringRoutineEnabled
                          ? handleTurnOffWateringMode()
                          : handleTurnOnWateringMode();
                      }}
                    />
                  </div>
                  <EditLabel
                    onClick={() =>
                      setShowWorkingRoutineOptions(!showWorkingRoutineOptions)
                    }
                  >
                    {translate("editWateringParams")}
                  </EditLabel>
                </SubOptionContainer>
                {showWorkingRoutineOptions && (
                  <WateringRoutineOptions
                    setRoutinePayload={setRoutinePayload}
                    routinePayload={routinePayload}
                    selectedDeviceSettings={deviceSettings} 
                    handleEditRoutine={handleEditRoutine}
                    wateringRoutineSettings={wateringRoutineSettings}
                    deviceId={deviceId}
                    selectedDevice={selectedDevice}
                    sendCommand={sendCommand}
                    userId={userId}
                  />
                )}
                <SubOptionContainer>
                  <SubOptionLabel>
                    {translate("manualTimerLabel")}
                  </SubOptionLabel>
                  <EditLabel
                    onClick={() => setEditManualTimer(!editManualTimer)}
                  >
                    {translate("editWateringParams")}
                  </EditLabel>
                </SubOptionContainer>
                {editManualTimer && (
                  <WateringParametersContainer>
                    <div style={{ display: "flex", margin: "20px 0 20px" }}>
                      <Input
                        className="manualTimerInput"
                        onChange={(e) => setManualTimer(e.target.value)}
                        value={manualTimer}
                        min={0}
                        max={200}
                        type="number"
                      />
                      <Disclaimer>minutos</Disclaimer>
                    </div>
										<SuccessButtonContainer>
                      <SuccessButton
                        success={editSuccess}
                        callBack={setEditSuccess}
                        onClick={() =>
                          handleEditRoutine({
                            wateringRoutineEnabledState: wateringRoutineEnabled,
                            editFromButton: true,
                            editManualPumpTimer: true
                          })
                        }
                        buttonLabel={translate("wateringSaveChangesButton")}
                        successLabel={translate(
                          "wateringSaveChangesSuccessLabel"
                        )}
                      />
                    </SuccessButtonContainer>
                  </WateringParametersContainer>
                )}
              </Collapsible>
            </Option>
          </Section>
          <Section>
            <Option>
              <Collapsible
                trigger={renderCollapsibleTitle(
                  translate("resetLocalStationLabel")
                )}
                triggerWhenOpen={renderCollapsibleTitle(
                  translate("resetLocalStationLabel"),
                  true
                )}
                transitionTime={150}
              >
                <ResetOption 
                  loading={loading} 
                  setLoading={setLoading} 
                  userId={userId}
                  deviceId={deviceId}
                />
              </Collapsible>
            </Option>
          </Section>
        </Options>
      ) : (
        "loading"
      )}
    </Container>
  );
};
