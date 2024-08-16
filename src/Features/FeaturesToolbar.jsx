import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Import from "@mui/icons-material/GetApp";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Popover from "@mui/material/Popover";
/*
 * Copyright (c) 2020 Andrew Cottam.
 *
 * This file is part of marxanweb/marxan-client
 * (see https://github.com/marxanweb/marxan-client).
 *
 * License: European Union Public Licence V. 1.2, see https://opensource.org/licenses/EUPL-1.2
 */
import React from "react";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";

const FeaturesToolbar = (props) => {
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
        <Button
          show={
            props.userRole !== "ReadOnly" &&
            !props.metadata.OLDVERSION &&
            !props.addingRemovingFeatures
          }
          startIcon={<FontAwesomeIcon icon={faPlusCircle} />}
          title="New feature"
          disabled={props.loading}
          onClick={(evt) => props.showNewFeaturePopover(evt)}
        >
          New
        </Button>
        <Popover
          open={props.newFeaturePopoverOpen}
          anchorEl={props.newFeatureAnchor}
          onClose={() => props.updateState({ newFeaturePopoverOpen: false })}
        >
          <Menu desktop={true}>
            <MenuItem
              primaryText="Draw on screen"
              title="Create a new feature by digitising it on the screen"
              onClick={() => props._newByDigitising()}
            />
          </Menu>
        </Popover>
        <Button
          show={
            !props.metadata.OLDVERSION &&
            !props.addingRemovingFeatures &&
            props.userRole !== "ReadOnly"
          }
          startIcon={<Import style={{ height: "20px", width: "20px" }} />}
          title="Create new features from existing data"
          disabled={props.loading}
          onClick={() => props.showImportFeaturePopover()}
        >
          Import
        </Button>
        <Popover
          open={props.importFeaturePopoverOpen}
          anchorEl={props.importFeatureAnchor}
          anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
          onClose={() => props.updateState({ importFeaturePopoverOpen: false })}
        >
          <Menu desktop={true}>
            <MenuItem
              primaryText="From a shapefile"
              title="Import one or more features from a shapefile"
              onClick={() => props._openImportFeaturesDialog()}
            />
            <MenuItem
              primaryText="From the web"
              title="Import one or more features from a web resource"
              onClick={() => props._openImportFromWebDialog()}
            />
            <MenuItem
              primaryText="From the Global Biodiversity Information Facility"
              title="The worlds largest provider of species observations"
              onClick={() => props.openImportGBIFDialog()}
            />
            <MenuItem
              primaryText="From the IUCN Red List of Threatened Species"
              disabled={true}
            />
          </Menu>
        </Popover>
        <Button
          show={
            props.userRole === "Admin" &&
            !props.metadata.OLDVERSION &&
            !props.addingRemovingFeatures
          }
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
        <Button
          show={props.addingRemovingFeatures}
          startIcon={<FontAwesomeIcon icon={faTimesCircle} />}
          title="Clear all features"
          onClick={() => props.updateState({ selectedFeatureIds: [] })}
        >
          Clear all
        </Button>
        <Button
          show={props.addingRemovingFeatures}
          startIcon={<FontAwesomeIcon icon={faCheckCircle} />}
          title="Select all features"
          onClick={() => props.selectAllFeatures()}
        >
          Select all
        </Button>
      </ButtonGroup>
    </div>
  );
};
export default FeaturesToolbar;
