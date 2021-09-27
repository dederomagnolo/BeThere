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
import COMMANDS from "../../services/commands";
import ResetOption from "./reset";
import { getUserDevices, getUserId } from "../../store/user/selectors";
import { updateDeviceSettings } from "../../store/user/actions";
import { setUserDevices } from "../../store/devices/actions";
import sendCommand from "../../services/sendCommand";
import {
  minutesToMilliseconds,
  secondsToMilliseconds,
} from "../../utils/functions";
import SuccessButton from "./successButton";

export const Settings = () => {
	const translate = useTranslate("settings");
	const dispatch = useDispatch();
  const userDevices = useSelector(getUserDevices);
  const userId = useSelector(getUserId);
  
	const [loading, setLoading] = useState(false);
	const [editManualTimer, setEditManualTimer] = useState(null);
	const [backlightStatus, setBacklightStatus] = useState(false);
	const [editSuccess, setEditSuccess] = useState(null);

  const [selectedDevice, setSelectedDevice] = useState(
    _.get(userDevices, "[0]")
  );
	const [deviceSettings, setDeviceSettings] = useState(_.get(userDevices, '[0].settings[0]'));

  
  const wateringRoutineSettings = _.get(deviceSettings, "wateringRoutine");
	const manualTimerFromRemote = _.get(deviceSettings, "pumpTimer");

  const wateringRoutineEnabled = _.get(wateringRoutineSettings, "enabled");
  const [showWorkingRoutineOptions, setShowWorkingRoutineOptions] = useState(
    wateringRoutineEnabled
  );

  const [routinePayload, setRoutinePayload] = useState({
    enabled: wateringRoutineEnabled,
    startTime: _.get(wateringRoutineSettings, "startTime"),
    endTime: _.get(wateringRoutineSettings, "endTime"),
    interval: _.get(wateringRoutineSettings, "interval"),
    duration: _.get(wateringRoutineSettings, "duration"),
  });
	const [manualTimer, setManualTimer] = useState(manualTimerFromRemote);
	
	const deviceId = _.get(selectedDevice, "_id");
	
  const userDeviceOptions = _.map(userDevices, (device) => {
    return {
      value: device._id,
      label: device.deviceSerialKey,
    };
  });
	
	const timeOptions = [];
  for (let i = 0; i < 24; i++) {
    timeOptions.push({
      value: i,
      label: `${i}h00`,
    });
  }

  const findTimeDefaultOption = (value) => {
    return _.find(timeOptions, (option) => option.value === value);
  };

  const handleEditRoutine = async (
    toggleOff = false,
    editFromButton = false,
		editManualPumpTimer = false
  ) => {
    try {
      setLoading(true);
      const {
        localMeasureInterval,
        remoteMeasureInterval,
        pumpTimer,
        backlight,
      } = deviceSettings;

      const { 
				startTime, 
				endTime, 
				interval, 
				duration 
			} = routinePayload;

			const payload = {
				userId,
				deviceId,
				settingsId: _.get(deviceSettings, "_id"),
				localMeasureInterval,
				remoteMeasureInterval,
				pumpTimer: editManualPumpTimer ? manualTimer : pumpTimer,
				backlight,
				wateringRoutine: {
					startTime: startTime,
					endTime: endTime,
					interval: interval,
					duration: duration,
					enabled: editManualPumpTimer ? toggleOff : !toggleOff,
				},
			}

      const editSettingsResponse = await api.post(
        `${bethereUrl}/settings/edit`,
        payload
      );

      if (!toggleOff) {
        await sendCommand(
          "SETTINGS_ON",
          userId,
          deviceId,
          `${backlight},${minutesToMilliseconds(
            pumpTimer
          )},${secondsToMilliseconds(
            localMeasureInterval
          )},${minutesToMilliseconds(
            remoteMeasureInterval
          )},${startTime},${endTime},${minutesToMilliseconds(
            duration
          )},${minutesToMilliseconds(interval)}`
        );
      }

      if (editSettingsResponse) {
        const res = await api.post(`${bethereUrl}/settings`, {
          deviceId: deviceId,
        });
        const deviceUpdatedSettings = _.get(res, "data.settingsFromDevice");
        setDeviceSettings(deviceUpdatedSettings[0]);
        dispatch(updateDeviceSettings({ deviceId, deviceUpdatedSettings }));
        if (editFromButton) {
          setTimeout(() => {
            setEditSuccess(true);
          }, 300);
          setTimeout(() => {
            setEditSuccess(false);
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
      await handleEditRoutine(true);
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

  const getDeviceSettings = () => {
    const selectedDeviceData = _.find(
      userDevices,
      (device) => deviceId === device._id
    );
    return _.get(selectedDeviceData, "settings[0]");
  };

  const handleSetSelectedDevice = (selected) => {
    const device = _.find(
      userDevices,
      (device) => selected.value === device._id
    );
    setSelectedDevice(device);


  };

  const handleSendCommand = async () => {
    setLoading(true);
    try {
      const lastBackLightResponse = await api.post(
        `${bethereUrl}/commands/laststatus`,
        {
          categoryName: COMMANDS.BACKLIGHT.NAME,
        }
      );
      const lastStatus = _.get(lastBackLightResponse, "data.value");

      if (lastStatus === COMMANDS.BACKLIGHT.ON) {
        const offRes = await sendCommand("BACKLIGHT_OFF", userId, deviceId);
        if (offRes) {
          setBacklightStatus(false);
        }
      } else {
        const onRes = await sendCommand("BACKLIGHT_ON", userId, deviceId);
        if (onRes) {
          setBacklightStatus(true);
        }
      }
      setTimeout(() => {
        setLoading(false);
      }, 3000);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const selectedDeviceSettings = getDeviceSettings();
    setDeviceSettings(selectedDeviceSettings);
    const routineSettings = _.get(selectedDeviceSettings, "wateringRoutine");
    setRoutinePayload({ ...routineSettings });
  }, [deviceId]);

  useEffect(() => {
    const fetchUserDevices = async () => {
      const res = await api.post(`${bethereUrl}/devices/user-devices`, {
        userId,
      });
      const userDevices = _.get(res, "data");
      dispatch(setUserDevices(userDevices));
    };
    const fetchBacklight = async () => {
      const res = await api.post(`${bethereUrl}/commands/laststatus`, {
        categoryName: COMMANDS.BACKLIGHT.NAME,
      });
      const backlightStatusValue = _.get(res, "data.value");
      if (backlightStatusValue === COMMANDS.BACKLIGHT.ON) {
        setBacklightStatus(true);
      } else {
        setBacklightStatus(false);
      }
    };
    fetchBacklight();
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
    <Container className="options" style={{ height: "100%", minWidth: "80%" }}>
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
          defaultValue={userDeviceOptions[0]}
          onChange={handleSetSelectedDevice}
          options={userDeviceOptions}
        />
        <Disclaimer>{translate("defaultDeviceDisclaimer")}</Disclaimer>
      </div>
      {deviceSettings ? (
        <Options>
          <Section>
            <Option className="backLightOption">
              <Collapsible
                trigger={renderCollapsibleTitle(translate("lcdBacklightLabel"))}
                triggerWhenOpen={renderCollapsibleTitle(
                  translate("lcdBacklightLabel"),
                  true
                )}
                transitionTime={150}
              >
                <Option className="selectBackLightTime">
                  <SubOptionLabel>
                    {translate("lcdBacklightTurnOnLabel")}
                  </SubOptionLabel>
                  <Toggle
                    name="backlight"
                    backgroundColorChecked="#3bea64"
                    disabled={loading}
                    checked={backlightStatus}
                    onChange={() => handleSendCommand()}
                  />
                </Option>
              </Collapsible>
            </Option>
          </Section>
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
                          handleEditRoutine(wateringRoutineEnabled, true, true)
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
                <ResetOption loading={loading} setLoading={setLoading} />
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
