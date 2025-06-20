import React, { useState } from "react";

import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ToolbarButton from "./ToolbarButton";
import { toggleDialog } from "@slices/uiSlice";
import { useDispatch } from "react-redux";

const SelectCostFeatures = ({ selectedCosts }) => {
  const dispatch = useDispatch();
  const [selectedFeature, setSelectedFeature] = useState(undefined);
  const [anchorEl, setAnchorEl] = useState(null);

  // Handlers
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSelectFeature = (feature) => {
    setSelectedFeature(feature);
  };

  return (
    <div className="newPUDialogPane">
      <div>Select the costs</div>
      <List>
        {selectedCosts.map((item) => (
          <ListItem
            key={item.id}
            secondaryAction={
              <>
                <IconButton onClick={handleMenuOpen}>
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={handleMenuClose}>Info</MenuItem>
                  <MenuItem onClick={handleMenuClose} title="Not implemented">
                    View
                  </MenuItem>
                  <MenuItem onClick={handleMenuClose} title="Not implemented">
                    Prioritise
                  </MenuItem>
                </Menu>
              </>
            }
          >
            <div>
              <div>{item.alias}</div>
              <div style={{ fontSize: "0.875rem", color: "grey" }}>
                {item.description}
              </div>
            </div>
          </ListItem>
        ))}
      </List>
      <ToolbarButton
        label="Select"
        onClick={() =>
          dispatch(
            toggleDialog({ dialogName: "costsDialogOpen", isOpen: true })
          )
        }
      />
    </div>
  );
};

export default SelectCostFeatures;
