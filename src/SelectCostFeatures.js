import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import MoreVertIcon from "@mui/icons-material/MoreVert";
/*
 * Copyright (c) 2020 Andrew Cottam.
 *
 * This file is part of marxanweb/marxan-client
 * (see https://github.com/marxanweb/marxan-client).
 *
 * License: European Union Public Licence V. 1.2, see https://opensource.org/licenses/EUPL-1.2
 */
import React from "react";
import ToolbarButton from "./ToolbarButton";
import grey from "@mui/material/colors/grey";

class SelectCostFeatures extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selectedFeature: undefined };
  }
  componentWillMount() {
    ListItem.defaultProps.disableTouchRipple = true;
    ListItem.defaultProps.disableFocusRipple = true;
  }
  changeFeature(event, feature) {
    this.setState({ selectedFeature: feature });
  }
  clickListItem(event) {}
  render() {
    const iconButtonElement = (
      <IconButton touch={true} tooltipPosition="bottom-left">
        <MoreVertIcon color={grey[400]} />
      </IconButton>
    );

    const rightIconMenu = (
      <MenuList iconButtonElement={iconButtonElement}>
        <MenuItem>Info</MenuItem>
        <MenuItem title="Not implemented">View</MenuItem>
        <MenuItem title="Not implemented">Prioritise</MenuItem>
      </MenuList>
    );

    return (
      <React.Fragment>
        <div className={"newPUDialogPane"}>
          <div>Select the costs</div>
          <List>
            {this.props.selectedCosts.map((item) => {
              return (
                <ListItem
                  disableFocusRipple={true}
                  primaryText={item.alias}
                  secondaryText={item.description}
                  key={item.id}
                  value={item.alias}
                  rightIconButton={rightIconMenu}
                />
              );
            })}
          </List>
          <ToolbarButton label="Select" onClick={this.props.openCostsDialog} />
        </div>
      </React.Fragment>
    );
  }
}

export default SelectCostFeatures;
