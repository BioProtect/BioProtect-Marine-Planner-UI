import React, { useState } from "react";
import {
  faCheckCircle,
  faPlusCircle,
  faTimesCircle,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";

import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Import from "@mui/icons-material/GetApp";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

const FeaturesToolbar = (props) => {
  const [newAnchorEl, setNewAnchorEl] = useState(null);
  const [importAnchorEl, setImportAnchorEl] = useState(null);
  const newOpen = Boolean(newAnchorEl);
  const importOpen = Boolean(importAnchorEl);

  const handleNewClick = (event) => setNewAnchorEl(event.currentTarget);
  const handleImportClick = (event) => setImportAnchorEl(event.currentTarget);
  const handleClose = () => {
    setNewAnchorEl(null);
    setImportAnchorEl(null);
  };

  return (
    <div>
      <div
        style={{
          display: props.metadata.OLDVERSION ? "block" : "none",
        }}
        className={"tabTitle"}
      >
        This is an imported project. Only features from this project are shown.
      </div>

      <ButtonGroup aria-label="Basic button group" fullWidth="true">
        {props.userRole !== "ReadOnly" &&
        !props.metadata.OLDVERSION &&
        !props.addingRemovingFeatures ? (
          <Button
            startIcon={<FontAwesomeIcon icon={faPlusCircle} />}
            title="New feature"
            disabled={props.loading}
            aria-controls={open ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            onClick={handleNewClick}
          >
            New
          </Button>
        ) : null}

        <Menu
          desktop={true}
          open={newOpen}
          anchorEl={newAnchorEl}
          onClose={handleClose}
        >
          <MenuItem
            primaryText="Draw on screen"
            title="Create a new feature by digitising it on the screen"
            onClick={() => props._newByDigitising()}
          >
            Create a new feature by digitising it on the screen
          </MenuItem>
        </Menu>

        {!props.metadata.OLDVERSION &&
        !props.addingRemovingFeatures &&
        props.userRole !== "ReadOnly" ? (
          <Button
            startIcon={<Import style={{ height: "20px", width: "20px" }} />}
            title="Create new features from existing data"
            disabled={props.loading}
            aria-controls={open ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            onClick={handleImportClick}
          >
            Import
          </Button>
        ) : null}

        <Menu
          desktop={true}
          open={importOpen}
          anchorEl={importAnchorEl}
          onClose={handleClose}
        >
          <MenuItem
            primaryText="From a shapefile"
            onClick={() => props._openImportFeaturesDialog()}
          >
            Import one or more features from a shapefile
          </MenuItem>
          <MenuItem
            primaryText="From the web"
            onClick={() => props._openImportFromWebDialog()}
          >
            Import one or more features from a web resource
          </MenuItem>
          <MenuItem
            primaryText="From the Global Biodiversity Information Facility"
            onClick={() => props.openImportGBIFDialog()}
          >
            The worlds largest provider of species observations
          </MenuItem>
          <MenuItem
            primaryText="From the IUCN Red List of Threatened Species"
            disabled={true}
          >
            From the IUCN Red List of Threatened Species
          </MenuItem>
        </Menu>

        {props.userRole === "Admin" &&
        !props.metadata.OLDVERSION &&
        !props.addingRemovingFeatures ? (
          <Button
            startIcon={
              <FontAwesomeIcon icon={faTrashAlt} color="rgb(255, 64, 129)" />
            }
            title="Delete feature"
            disabled={
              props.selectedFeature === undefined ||
              props.loading ||
              (props.selectedFeature &&
                props.selectedFeature.created_by === "global admin")
            }
            onClick={() => props._delete()}
          >
            Delete
          </Button>
        ) : null}

        {props.addingRemovingFeatures ? (
          <Button
            startIcon={<FontAwesomeIcon icon={faTimesCircle} />}
            title="Clear all features"
            onClick={() => props.updateState({ selectedFeatureIds: [] })}
          >
            Clear all
          </Button>
        ) : null}
        {props.addingRemovingFeatures ? (
          <Button
            startIcon={<FontAwesomeIcon icon={faCheckCircle} />}
            title="Select all features"
            onClick={() => props.selectAllFeatures()}
          >
            Select all
          </Button>
        ) : null}
      </ButtonGroup>
    </div>
  );
};
export default FeaturesToolbar;
