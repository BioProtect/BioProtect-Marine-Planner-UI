import MenuItem from "@mui/material/MenuItem";
/*
 * Copyright (c) 2020 Andrew Cottam.
 *
 * This file is part of marxanweb/marxan-client
 * (see https://github.com/marxanweb/marxan-client).
 *
 * License: European Union Public Licence V. 1.2, see https://opensource.org/licenses/EUPL-1.2
 */
import React from "react";
import Select from "@mui/material/Select";

class SpatialDataSelector extends React.Component {
  changeTileset = (event, index, value) => {
    this.props.changeTileset(this.props.tilesets[index].id);
  };

  render() {
    let c = this.props.tilesets.map((tileset) => {
      return (
        <MenuItem
          value={tileset.id}
          key={tileset.name}
          title={tileset.name}
          tileset={tileset}
        />
      );
    });
    return (
      <div>
        <Select
          floatingLabelText="Mapbox layer"
          floatingLabelFixed={true}
          maxHeight={200}
          style={{ width: "345px" }}
          menuItemStyle={{ fontSize: "13px" }}
          value={this.props.value}
          onChange={this.changeTileset.bind(this)}
        >
          {c}
        </Select>
      </div>
    );
  }
}

export default SpatialDataSelector;
