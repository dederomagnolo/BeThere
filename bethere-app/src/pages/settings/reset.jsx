import React, {useState} from 'react';
import api from '../../services'
import {Option, OptionLabel, Button} from './styles';
import {bethereUrl} from '../../services/configs';
import commands from '../../services/commands';
import { ThreeBounce } from 'styled-spinkit';

const ResetOption = ({loading, setLoading}) => {
    const [reseting, setReseting] = useState(false);
    const handleReset = async() => {
        setLoading(true);
        setReseting(true);
        const res = await api.post(`${bethereUrl}/send`, {
            commandName: commands.RESET.NAME,
            changedFrom: "App",
            value: commands.RESET.COMMAND
        });

        setTimeout(() => {
            setLoading(false);
            setReseting(false);
        }, 10000);
    }

    return (
        <Option className="resetOption">
            <OptionLabel>
                Reset Local Station
            </OptionLabel>
            <p>
                Your local station can take around 10 seconds to reboot the system and estabilish internet connection again.
            </p>
            <p>
                Check your internet connection before rebooting.
            </p>
            <Button disabled={loading} onClick={() => handleReset()} >  
                {reseting ? <ThreeBounce color={'white'} className="loader"/> : "Reset"}
            </Button>
        </Option>
    );
}

export default ResetOption;