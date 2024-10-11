/*
 * Copyright (c) 2020 Andrew Cottam.
 *
 * This file is part of marxanweb/marxan-client
 * (see https://github.com/marxanweb/marxan-client).
 *
 * License: European Union Public Licence V. 1.2, see https://opensource.org/licenses/EUPL-1.2
 */
import React, { useState } from "react";

import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MarxanDialog from "./MarxanDialog";
import Notification from "./Notification";
import ToolbarButton from "./ToolbarButton";
import { faDraftingCompass } from "@fortawesome/free-solid-svg-icons";
import { faSync } from "@fortawesome/free-solid-svg-icons";

const Welcome = (props) => {
  const [checked, setChecked] = useState(true);

  const toggleShowWelcomeScreen = (evt, isInputChecked) => {
    setChecked(isInputChecked);
  };

  const onOk = () => {
    props.saveOptions({ SHOWWELCOMESCREEN: checked });
    props.updateState({ welcomeDialogOpen: false });
  };

  const openNewProjectDialog = () => {
    onOk();
    props.openNewProjectDialog();
  };

  let notificationsPanel = (
    <div className="notifications">
      {props.notifications
        ?.filter((item) => item.visible)
        .map((item) => (
          <Notification
            html={item.html}
            type={item.type}
            key={item.id}
            removeNotification={() => props.removeNotification(item)}
          />
        ))}
      <div className="notificationPointer"></div>
    </div>
  );

  return (
    <MarxanDialog
      {...props}
      contentWidth={768}
      offsetY={80}
      title="Welcome"
      helpLink={"user.html#welcome"}
      onOk={() => onOk()}
      showCancelButton={false}
      autoDetectWindowHeight={false}
    >
      {
        <React.Fragment key={"welcomeKey"}>
          <div className={"welcomeContent"}>
            <div className={"tabTitle"}>What do you want to do?</div>
            <div className={"task"}>
              <div className={"taskItem"}>
                <ToolbarButton
                  icon={<FontAwesomeIcon icon={faDraftingCompass} />}
                  title={"Design a protected area network"}
                  onClick={() => openNewProjectDialog()}
                  className={"resetNotifications"}
                />
                <span>Create a new protected area network for a country</span>
              </div>
              <div className={"taskItem"}>
                <ToolbarButton
                  icon={<FontAwesomeIcon icon={faDraftingCompass} />}
                  title={"Extend a protected area network"}
                  onClick={() => openNewProjectDialog()}
                  className={"resetNotifications"}
                />
                <span>
                  Extend an existing protected area network for a country
                </span>
              </div>
              <div className={"taskItem"}>
                <ToolbarButton
                  icon={<FontAwesomeIcon icon={faDraftingCompass} />}
                  title={"Do a gap analysis"}
                  onClick={() => openNewProjectDialog()}
                  className={"resetNotifications"}
                />
                <span>Do a national gap analysis</span>
              </div>
            </div>
            <div style={{ verticalAlign: "middle" }}>
              <Button
                icon={<FontAwesomeIcon icon={faSync} />}
                title={"Reset notifications"}
                onClick={props.resetNotifications}
                style={{
                  minWidth: "24px",
                  height: "24px",
                  lineHeight: "24px",
                  color: "rgba(0,0,0,0.67)",
                  position: "absolute",
                  bottom: "10px",
                }}
              />
            </div>
            {notificationsPanel ? (
              <div className={"notifications"}>{notificationsPanel}</div>
            ) : null}
            <div className="welcomeToolbar">
              <Checkbox
                label="Show at startup"
                style={{ fontSize: "12px" }}
                checked={checked}
                onCheck={() => toggleShowWelcomeScreen()}
                className={"showAtStartupChk"}
              />
            </div>
          </div>
        </React.Fragment>
      }
    </MarxanDialog>
  );
};

export default Welcome;
