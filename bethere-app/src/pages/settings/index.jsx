import React, {useEffect, useState} from 'react';
import Toggle from 'react-styled-toggle';
import * as _ from 'lodash';
import Select from 'react-select';
import {useSelector, useDispatch} from 'react-redux';
import {ArrowIosDownwardOutline} from '@styled-icons/evaicons-outline/ArrowIosDownwardOutline';
import {ArrowIosUpwardOutline} from '@styled-icons/evaicons-outline/ArrowIosUpwardOutline';
import {Container} from 'react-grid-system';
import Collapsible from 'react-collapsible';
import {Pulse} from 'styled-spinkit';
import '../../styles/styles.css';
import api from '../../services';
import {bethereUrl} from '../../services/configs';
import {Header} from '../../components/header';
import {
    Option, 
    OptionLabel, 
    Button, 
    Options,
    SubOption,
    SubOptionLabel, 
    Section, 
    Input, 
    CollapsibleHeader
} from './styles';
import COMMANDS from '../../services/commands';
import ResetOption from './reset';
import { getUserDevices, getUserId } from '../../store/user/selectors';
import {updateDeviceSettings} from '../../store/user/actions';
import sendCommand from '../../services/sendCommand';
import {minutesToMilliseconds, secondsToMilliseconds} from '../../utils/functions';

export const Settings = () => {
    const userDevices = useSelector(getUserDevices);
    const userId = useSelector(getUserId);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState(_.get(userDevices, '[0]._id'));
    const [deviceSettings, setDeviceSettings] = useState(null);
    const wateringRoutineSettings = _.get(deviceSettings, 'wateringRoutine');
    const wateringRoutineEnabled = _.get(wateringRoutineSettings, 'enabled');
    const [showWorkingRoutineOptions, setShowWorkingRoutineOptions] = useState(wateringRoutineEnabled);
    const [routinePayload, setRoutinePayload] = useState({
		enabled: wateringRoutineEnabled,
		startTime: _.get(wateringRoutineSettings, 'startTime'),
		endTime: _.get(wateringRoutineSettings, 'endTime'),
		interval: _.get(wateringRoutineSettings, 'interval'),
		duration: _.get(wateringRoutineSettings, 'duration')
	});
    const [backlightStatus, setBacklightStatus] = useState(false);
    const timeOptions = [];
    const userDeviceOptions = _.map(userDevices, (device) => {
        return {
            value: device._id,
            label: device.deviceSerialKey
        }
    });

    for(let i = 0; i < 24 ; i++) {
        timeOptions.push({
            value: i, label: `${i}h00`
        });
    }

    const findTimeDefaultOption = (value) => {
        return _.find(timeOptions, (option) => option.value === value);
    }

    const handleShowRoutineOptions = async () => {
        if(showWorkingRoutineOptions) {
            await handleEditRoutine();
            await sendCommand("WATERING_AUTO_OFF");
        }
        setShowWorkingRoutineOptions(!showWorkingRoutineOptions);
        setRoutinePayload({...routinePayload, enabled: !showWorkingRoutineOptions});
    }

    const handleEditRoutine = async () => {
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
            } = routinePayload

            const editSettingsResponse = await api.post(`${bethereUrl}/settings/edit` , {
                userId,
                deviceId: selectedDevice,
                settingsId: _.get(deviceSettings, '_id'),
                localMeasureInterval,
                remoteMeasureInterval,
                pumpTimer,
                backlight,
                wateringRoutine: {
                    startTime: startTime,
                    endTime: endTime,
                    interval: interval,
                    duration: duration,
                    enabled: showWorkingRoutineOptions
                }
            });

            if(showWorkingRoutineOptions) {
                await sendCommand('WATERING_AUTO_ON');
                await sendCommand(
                    'SETTINGS_ON', 
                    `${backlight},${minutesToMilliseconds(pumpTimer)},${secondsToMilliseconds(localMeasureInterval)},${minutesToMilliseconds(remoteMeasureInterval)},${startTime},${endTime},${minutesToMilliseconds(duration)},${minutesToMilliseconds(interval)}`
                );
            }

            if(editSettingsResponse) {
                await api.post(`${bethereUrl}/settings` , {
                    deviceId: selectedDevice
                });
                dispatch(updateDeviceSettings(selectedDevice));
            }
            setLoading(false);
        } catch (err) {
            setLoading(false);
            console.log(err);
        }
    }

    const getDeviceSettings = () => {
        const selectedDeviceData = _.find(userDevices, (device) => selectedDevice === device._id);
        return _.get(selectedDeviceData, 'settings[0]');
    }

    const handleSendCommand = async () => {
        setLoading(true);
        try {
            const lastBackLightResponse = await api.post(`${bethereUrl}/commands/laststatus` , {
                categoryName: COMMANDS.BACKLIGHT.NAME
            });
            const lastStatus = _.get(lastBackLightResponse, 'data.value');

            if(lastStatus === COMMANDS.BACKLIGHT.ON) {
                const offRes = await sendCommand('BACKLIGHT_OFF');
                if(offRes) { 
                    setBacklightStatus(false);
                }
            } else {
                const onRes = await sendCommand('BACKLIGHT_ON');

                if(onRes) {
                    setBacklightStatus(true);
                }
            }
            setTimeout(() => {
                setLoading(false);
            }, 3000);
        } catch(err) {
            console.log(err);
        }
    };

    useEffect(() => {
        const selectedDeviceSettings = getDeviceSettings();
        setDeviceSettings(selectedDeviceSettings);
        const routineSettings = _.get(selectedDeviceSettings, 'wateringRoutine');
        const isRoutineEnabled = _.get(routineSettings, 'enabled');
        setRoutinePayload({...routineSettings});
        setShowWorkingRoutineOptions(isRoutineEnabled);
    }, [selectedDevice]);

    useEffect(() => {
        const fetchBacklight = async () => {
            const res = await api.post(`${bethereUrl}/commands/laststatus` , {
                categoryName: COMMANDS.BACKLIGHT.NAME
            });
            const backlightStatusValue = _.get(res, 'data.value');
            if(backlightStatusValue === COMMANDS.BACKLIGHT.ON) {
                setBacklightStatus(true);
            } else {
                setBacklightStatus(false);
            }
        }
        /* 
        const fetchDeviceSettings = async() => {
            const res = await api.post(`${bethereUrl}/settings`, {
                deviceId: selectedDevice
            });

            console.log(res);
            if(res) {
                setSelectedDeviceSettings(_.get(res, 'data.settingsFromDevice[0]'));
            }
            
        } */
        fetchBacklight();
        // fetchDeviceSettings();
    }, []);

    return (
        <Container className="options" style={{height: '100%', minWidth: '80%'}}>
            <Header title="Settings"/>
            <div>
                <OptionLabel>Device</OptionLabel>
                <Select
                    defaultValue={userDeviceOptions[0]}
                    onChange={(selected) => setSelectedDevice(selected.value)}
                    options={userDeviceOptions}
                />
            </div>
            {deviceSettings ? <Options>
                <Section>
                    <Option className="backLightOption">
                        <Collapsible 
                            trigger={
                                <CollapsibleHeader>
                                    <OptionLabel>
                                        LCD Backlight
                                    </OptionLabel>
                                    <ArrowIosDownwardOutline size={20} />
                                </CollapsibleHeader>
                            }
                            triggerWhenOpen={
                                <CollapsibleHeader>
                                    <OptionLabel>
                                        LCD Backlight
                                    </OptionLabel>
                                    <ArrowIosUpwardOutline size={20} />
                                </CollapsibleHeader>
                            }
                            transitionTime={150}
                        >
                            <Option className="selectBackLightTime">
                                <SubOptionLabel>Turn on</SubOptionLabel>   
                                <Toggle
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
                            trigger={
                                <CollapsibleHeader>
                                    <OptionLabel>
                                        Watering
                                    </OptionLabel>
                                    <ArrowIosDownwardOutline size={20} />
                                </CollapsibleHeader>
                            }
                            triggerWhenOpen={
                                <CollapsibleHeader>
                                    <OptionLabel>
                                        Watering
                                    </OptionLabel>
                                    <ArrowIosUpwardOutline size={20} />
                                </CollapsibleHeader>
                            }
                            transitionTime={150}
                        >
                            <Option>
                                <SubOptionLabel>Watering routine</SubOptionLabel>
                                <Toggle                                
                                    disabled={loading}
                                    checked={showWorkingRoutineOptions} 
                                    onChange={() => handleShowRoutineOptions()}
                                />
                            </Option>
                            {showWorkingRoutineOptions && (
                                <div>
                                    <SubOption>
                                        <SubOptionLabel>Start time:</SubOptionLabel>
                                        <Select
                                            onChange={(selected) => setRoutinePayload({
                                                ...routinePayload, 
                                                startTime: selected.value
                                            })}
                                            defaultValue={findTimeDefaultOption(routinePayload.startTime)}
                                            menuPortalTarget={document.querySelector('body')}
                                            options={timeOptions} 
                                        />
                                        <SubOptionLabel className="secondSubOption">End time:</SubOptionLabel>
                                        <Select
                                            onChange={(selected) => setRoutinePayload({
                                                ...routinePayload,
                                                endTime: selected.value
                                            })}
                                            defaultValue={findTimeDefaultOption(routinePayload.endTime)}
                                            menuPortalTarget={document.querySelector('body')}
                                            options={timeOptions} 
                                        />
                                    </SubOption>
                                    <SubOption>
                                        <SubOptionLabel>Interval to turn on:</SubOptionLabel>
                                        <Input
                                            onChange={(e) => setRoutinePayload({
                                                ...routinePayload,
                                                interval: e.target.value 
                                            })}
                                            value={routinePayload.interval}
                                            placeholder={"minutes"} 
                                            type="number"
                                            min={0}
                                            max={40}
                                        />
                                        <SubOptionLabel className="secondSubOption">Watering timer:</SubOptionLabel>
                                        <Input 
                                            onChange={(e) => setRoutinePayload({
                                                ...routinePayload,
                                                duration: e.target.value 
                                            })}
                                            value={routinePayload.duration}
                                            placeholder={"minutes"} 
                                            type="number"
                                            min={0}
                                            max={200}
                                        />
                                    </SubOption>
                                    <div style={{display: 'flex', width: '100%', justifyContent: 'flex-end  '}}>
                                        {loading 
                                            ? <Pulse /> 
                                            : <Button onClick={() => handleEditRoutine()}>Save changes</Button>}
                                    </div>
                                </div>)}
                        </Collapsible>
                    </Option>
                </Section>
                <Section>
                    <ResetOption loading={loading} setLoading={setLoading} />
                </Section>
            </Options> : 'loading'}
        </Container>        
    );
}   