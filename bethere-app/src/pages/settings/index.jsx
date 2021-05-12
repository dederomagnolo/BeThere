import React, {useEffect, useState} from 'react';
import Toggle from 'react-styled-toggle';
import * as _ from 'lodash';
import Select from 'react-select';
import {useSelector} from 'react-redux';
import {ArrowIosDownwardOutline} from '@styled-icons/evaicons-outline/ArrowIosDownwardOutline';
import {ArrowIosUpwardOutline} from '@styled-icons/evaicons-outline/ArrowIosUpwardOutline';
import {Container} from 'react-grid-system';
import Collapsible from 'react-collapsible';
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
import commands from '../../services/commands';
import ResetOption from './reset';
import { getUserDevices, getUserId } from '../../store/user/selectors';

export const Settings = () => {
    const userDevices = useSelector(getUserDevices);
    const userId = useSelector(getUserId);
    const [loading, setLoading] = useState(false);
    const [routinePayload, setRoutinePayload] = useState({
		enabled: false,
		startTime: null,
		endTime: null,
		interval: null,
		duration: null
	});
    const [selectedDevice, setSelectedDevice] = useState(userDevices[0]._id);
    const [deviceSettings, setDeviceSettings] = useState(null);
    const wateringRoutineSettings = _.get(deviceSettings, 'wateringRoutine');
    const wateringRoutineEnabled = _.get(wateringRoutineSettings, 'enabled');
    const duration = _.get(wateringRoutineSettings, 'duration');
    const interval = _.get(wateringRoutineSettings, 'interval');
    const startTime = _.get(wateringRoutineSettings, 'startTime');
    const endTime = _.get(wateringRoutineSettings, 'endTime');
    const [showWorkingRoutineOptions, setShowWorkingRoutineOptions] = useState(wateringRoutineEnabled);
    const [backlightStatus, setBacklightStatus] = useState(false);
    const timeOptions = [];
    const userDeviceOptions = _.map(userDevices, (device) => {
        return {
            value: device._id,
            label: device.deviceSerialKey
        }
    });

    console.log(showWorkingRoutineOptions);

    for(let i = 0; i < 24 ; i++) {
        timeOptions.push({
            value: i, label: `${i}h00`
        });
    }

    const findTimeDefaultOption = (value) => {
        return _.find(timeOptions, (option) => option.value === value);
    }

    const handleShowRoutineOptions = () => {
        setRoutinePayload({...routinePayload, enabled: !showWorkingRoutineOptions})
        setShowWorkingRoutineOptions(!showWorkingRoutineOptions);
    }

    const handleChangeBacklightStatus = async () => {
        setLoading(true);
        try {
            const res = await api.post(`${bethereUrl}/settings/edit`, {
                userId,
                settingsId: deviceSettings._id,
                deviceId: _.find(userDevices, (device) => selectedDevice === device._id)
            });
        } catch (err){
            console.log(err);
        }
    }

    const handleEditRoutine = () => {
        console.log(routinePayload);
    }

    const getDeviceSettings = () => {
        const selectedDeviceData = _.find(userDevices, (device) => selectedDevice === device._id);
        return _.get(selectedDeviceData, 'settings[0]');
    }

    const handleSendCommand = async () => {
        setLoading(true);
        try {
            const lastBackLightResponse = await api.post(`${bethereUrl}/commands/laststatus` , {
                commandName: commands.BACKLIGHT.NAME
            });
            const lastStatus = _.get(lastBackLightResponse, 'data.value');

            if(lastStatus === commands.BACKLIGHT.ON) {
                const offRes = await api.post(`${bethereUrl}/send`, {
                    commandName: commands.BACKLIGHT.NAME,
                    changedFrom: "App",
                    value: commands.BACKLIGHT.OFF
                });

                if(offRes) { 
                    setBacklightStatus(false);
                }
            } else {
                const onRes = await api.post(`${bethereUrl}/send`, {
                    commandName: commands.BACKLIGHT.NAME,
                    changedFrom: "App",
                    value: commands.BACKLIGHT.ON
                });

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
    }

    useEffect(() => {
        handleShowRoutineOptions();
        setDeviceSettings(getDeviceSettings());
    }, [selectedDevice]);

    useEffect(() => {
        const fetchBacklight = async () => {
            const res = await api.post(`${bethereUrl}/commands/laststatus` , {
                commandName: commands.BACKLIGHT.NAME
            });
            const backlightStatusValue = _.get(res, 'data.value');
            if(backlightStatusValue === commands.BACKLIGHT.ON) {
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
                                            defaultValue={findTimeDefaultOption(startTime)}
                                            menuPortalTarget={document.querySelector('body')}
                                            options={timeOptions} 
                                        />
                                        <SubOptionLabel>End time:</SubOptionLabel>
                                        <Select
                                            onChange={(selected) => setRoutinePayload({
                                                ...routinePayload,
                                                endTime: selected.value
                                            })}
                                            defaultValue={findTimeDefaultOption(endTime)}
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
                                            value={interval}
                                            placeholder={"minutes"} 
                                            type="number"
                                            min={0}
                                            max={40}
                                        />
                                        <SubOptionLabel>Watering timer:</SubOptionLabel>
                                        <Input 
                                            onChange={(e) => setRoutinePayload({
                                                ...routinePayload,
                                                duration: e.target.value 
                                            })}
                                            value={duration}
                                            placeholder={"minutes"} 
                                            type="number"
                                            min={0}
                                            max={200}
                                        />
                                    </SubOption>
                                    <div style={{display: 'flex', width: '100%', justifyContent: 'flex-end  '}}>
                                        <Button onClick={() => handleEditRoutine()}>Save changes</Button>
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