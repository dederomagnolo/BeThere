import React, {useState} from 'react';
import {ThreeBounce} from 'styled-spinkit';
import {useTranslate} from 'react-translate';
import api from '../../services'
import {Option, OptionLabel, ResetButton} from './styles';
import {bethereUrl} from '../../services/configs';
import commands from '../../services/commands';

const ResetOption = ({loading, setLoading}) => {
    const [reseting, setReseting] = useState(false);
    const translate = useTranslate('settings');

    const handleReset = async() => {
        setLoading(true);
        setReseting(true);
        await api.post(`${bethereUrl}/send`, {
            categoryName: commands.RESET.NAME,
            changedFrom: "App",
            commandName: commands.RESET.COMMAND
        });

        setTimeout(() => {
            setLoading(false);
            setReseting(false);
        }, 10000);
    }

    return (
        <Option className="resetOption">
            <p>
                {translate('resetContent1')}
            </p>
            <p>
                {translate('resetContent2')}
            </p>
            <ResetButton disabled={loading} onClick={() => handleReset()}>  
                {reseting ? <ThreeBounce color={'white'} className="loader"/> : translate('resetButtonLabel')}
            </ResetButton>
        </Option>
    );
}

export default ResetOption;