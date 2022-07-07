import React, { useState } from "react";
import { ThreeBounce } from "styled-spinkit";
import { useTranslate } from "react-translate";
import api from "../../services";
import { Option, OptionLabel, ResetButton } from "./styles";
import { bethereUrl } from "../../services/configs";
import { COMMANDS } from "../../services/commands";

const ResetOption = ({ loading, setLoading, deviceId, userId }) => {
  const [reseting, setReseting] = useState(false);
  const translate = useTranslate("settings");
  const handleReset = async () => {
    setLoading(true);
    setReseting(true);
    await api.post(`${bethereUrl}/send`, {
      categoryName: COMMANDS.SYSTEM.NAME,
      changedFrom: "App",
      commandName: COMMANDS.SYSTEM.RESET_ESP,
      userId,
      deviceId,
    });

    setTimeout(() => {
      setLoading(false);
      setReseting(false);
    }, 10000);
  };

  return (
    <Option className="resetOption">
      <p>{translate("resetContent1")}</p>
      <p>{translate("resetContent2")}</p>
      <ResetButton disabled={loading} onClick={() => handleReset()}>
        {reseting ? (
          <ThreeBounce color={"white"} className="loader" />
        ) : (
          translate("resetButtonLabel")
        )}
      </ResetButton>
    </Option>
  );
};

export default ResetOption;
