import MarxanDialog from "./MarxanDialog";
/*
 * Copyright (c) 2020 Andrew Cottam.
 *
 * This file is part of marxanweb/marxan-client
 * (see https://github.com/marxanweb/marxan-client).
 *
 * License: European Union Public Licence V. 1.2, see https://opensource.org/licenses/EUPL-1.2
 */
//a dialog box that is shown when the user first logs in to alert them to anything, e.g. A new version of the WDPA is available for admin users
import React from "react";

const AlertDialog = (props) => {
  return (
    <MarxanDialog {...props} contentWidth={500} offsetY={80} title="Alert">
      <div key="k23">
        <div className={"description"}>
          A new version of the WDPA is available. <br />
          Click on Help | Server Details for more information.
        </div>
      </div>
    </MarxanDialog>
  );
};

export default AlertDialog;
