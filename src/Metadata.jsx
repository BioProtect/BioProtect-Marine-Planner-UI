/*
 * Copyright (c) 2020 Andrew Cottam.
 *
 * This file is part of marxanweb/marxan-client
 * (see https://github.com/marxanweb/marxan-client).
 *
 * License: European Union Public Licence V. 1.2, see https://opensource.org/licenses/EUPL-1.2
 */
import React, { useState } from "react";

import TextField from "@mui/material/TextField";

const Metadata = (props) => {
  const [validName, setValidName] = useState(undefined);

  const changeName = (event, newValue) => props.setName(newValue);
  const changeDescription = (event, newValue) => props.setDescription(newValue);
  return (
    <React.Fragment>
      <div style={{ marginTop: "-13px" }}>
        <TextField
          margin="normal"
          required
          fullWidth
          style={{ width: "310px" }}
          errorText={validName === false ? "Required field" : ""}
          value={props.name}
          onChange={changeName}
          floatingLabelText="Enter a name for the project"
        />
        <TextField
          style={{ width: "310px" }}
          value={props.description}
          onChange={changeDescription}
          multiLine={true}
          rows={3}
          floatingLabelText="Enter a description for the project"
        />
      </div>
    </React.Fragment>
  );
};

export default Metadata;
