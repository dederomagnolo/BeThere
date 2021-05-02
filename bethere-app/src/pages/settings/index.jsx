import React, {useEffect, useState} from 'react';
import Toggle from 'react-styled-toggle';
import {ArrowIosDownwardOutline} from '@styled-icons/evaicons-outline/ArrowIosDownwardOutline';
import {ArrowIosUpwardOutline} from '@styled-icons/evaicons-outline/ArrowIosUpwardOutline';
import * as _ from 'lodash';
import Select from 'react-select';
import {Container} from 'react-grid-system';
import Collapsible from 'react-collapsible';
import '../../styles/styles.css';
import api from '../../services';
import {bethereUrl} from '../../services/configs';
import {Header} from '../../components/header';


import {Option, OptionLabel, Button, Options, SubOptionLabel, Section, Input} from './styles';
import commands from '../../services/commands';

import ResetOption from './reset';

export const Settings = () => {
    const [backlightStatus, setBacklightStatus] = useState(false);
    const [loading, setLoading] = useState(false);
    const timeOptions = [];
    for(let i = 0; i < 24 ; i++) {
        timeOptions.push({
            value: `${i}`, label: `${i}h`
        })
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
        const fetchBacklight = async () => {
            const res = await api.post(`${bethereUrl}/commands/laststatus` , {
                commandName: commands.BACKLIGHT.NAME
            });
            const backlightStatusValue = _.get(res, 'data.value');
            console.log(res);
            if(backlightStatusValue === commands.BACKLIGHT.ON) {
                setBacklightStatus(true);
            } else {
                setBacklightStatus(false);
            }
        }
        fetchBacklight();
    }, []);

    return (
        <Container style={{height: '100%', minWidth: '80%'}}>
            <Header title="Settings"/>
            <Options>
                <Section>
                    <Option className="backLightOption">
                        <Collapsible 
                            trigger={
                                <div style={{display: 'flex', justifyContent: 'space-between', width: '100%'}} >
                                    <OptionLabel>
                                        LCD Backlight
                                    </OptionLabel>
                                    <ArrowIosDownwardOutline size={20} />
                                </div>
                            }
                            triggerWhenOpen={
                                <div style={{display: 'flex', justifyContent: 'space-between', width: '100%'}} >
                                    <OptionLabel>
                                        LCD Backlight
                                    </OptionLabel>
                                    <ArrowIosUpwardOutline size={20} />
                                </div>
                            }
                            /* triggerStyle={<ArrowIosDownwardOutline size={20} />} */
                            transitionTime={200}
                        >
                            <Option className="selectBackLightTime">
                                <SubOptionLabel>Turn on</SubOptionLabel>   
                                <Toggle
                                    disabled={loading}
                                    checked={backlightStatus} 
                                    onChange={() => handleSendCommand()}
                                />
                                {/* <SubOptionLabel>
                                    Default time to turn backlight off
                                </SubOptionLabel>
                                <Select
                                    options={timeOptions} 
                                />
                                <SubOptionLabel>
                                    Default time to turn backlight on
                                </SubOptionLabel>
                                <Select
                                    options={timeOptions} 
                                /> */}
                            </Option>
                        </Collapsible>
                    </Option>
                </Section>
                <Section>
                    <Option>    
                        <Collapsible
                            trigger={
                                <div style={{display: 'flex', justifyContent: 'space-between', width: '100%'}} >
                                    <OptionLabel>
                                        Pump
                                    </OptionLabel>
                                    <ArrowIosDownwardOutline size={20} />
                                </div>
                            }
                            triggerWhenOpen={
                                <div style={{display: 'flex', justifyContent: 'space-between', width: '100%'}} >
                                    <OptionLabel>
                                        Pump
                                    </OptionLabel>
                                    <ArrowIosUpwardOutline size={20} />
                                </div>
                            }
                        >
                            
                                <SubOptionLabel>Manual timer</SubOptionLabel>
                                <Input 
                                    placeholder={"minutes"} 
                                    type="number"
                                    min={0}
                                    max={1}
                                />
                            
                        </Collapsible>
                    </Option>
                </Section>
                <Section>
                    <ResetOption loading={loading} setLoading={setLoading} />
                </Section>
            </Options>
        </Container>        
    );
}