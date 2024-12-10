import { useDispatch, useSelector } from "react-redux";

import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import React from "react";
import ToolbarButton from "./ToolbarButton";
import grey from "@mui/material/colors/grey";
import { toggleDialog } from "./slices/uiSlice";

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
                  secondaryText={item.description.toString()}
                  key={item.id}
                  value={item.alias}
                  rightIconButton={rightIconMenu}
                />
              );
            })}
          </List>
          <ToolbarButton
            label="Select"
            onClick={dispatch(
              toggleDialog({ dialogName: "costsDialogOpen", isOpen: true })
            )}
          />
        </div>
      </React.Fragment>
    );
  }
}

export default SelectCostFeatures;
