/*
 * Copyright (c) 2020 Andrew Cottam.
 *
 * This file is part of marxanweb/marxan-client
 * (see https://github.com/marxanweb/marxan-client).
 *
 * License: European Union Public Licence V. 1.2, see https://opensource.org/licenses/EUPL-1.2
 */
import React, { useState } from "react";

import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";

const Metadata = ({ name, description, setName, setDescription }) => {
  const changeName = (event) => setName(event.target.value);
  const changeDescription = (event) => setDescription(event.target.value);
  return (
    <div>
      <FormControl fullWidth>
        <TextField
          margin="normal"
          required={true}
          id="projectname"
          label="Enter a name for the project"
          name="projectname"
          autoFocus
          onChange={changeName}
          value={name}
        />
        <TextField
          margin="normal"
          fullWidth
          id="projectdescription"
          name="projectdescription"
          onChange={changeDescription}
          rows={3}
          label="Enter a description for the project"
          value={description}
        />
      </FormControl>
    </div>
  );
};

export default Metadata;
