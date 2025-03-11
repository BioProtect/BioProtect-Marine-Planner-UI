import React, { useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { getArea, isNumber, isValidTargetValue } from "../Helpers";
import {
  setActiveTab,
  toggleDialog,
} from "../slices/uiSlice";
import { useDispatch, useSelector } from "react-redux";

import CONSTANTS from "../constants";
import MarxanDialog from "../MarxanDialog";
import { selectCurrentUser } from "../slices/authSlice";
import { toggleFeatureD } from "../slices/featureSlice";

const FeatureInfoDialog = ({ loading, updateFeature }) => {
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui);
  const dialogStates = useSelector((state) => state.ui.dialogStates);
  const featureStates = useSelector((state) => state.ui.featureDialogStates);
  const userData = useSelector(selectCurrentUser);

  const closeDialog = () =>
    dispatch(
      toggleFeatureD({
        dialogName: "featureInfoDialogOpen",
        isOpen: false,
      })
    );

  const updateFeatureValue = useCallback(
    (key, e) => {
      const value = e.currentTarget.textContent;
      if (
        (key === "target_value" && isValidTargetValue(value)) ||
        (key === "spf" && isNumber(value))
      ) {
        const updatedProps = { [key]: value };
        updateFeature(uiState.feature, updatedProps);
      } else {
        alert("Invalid value");
      }
    },
    [uiState.feature, updateFeature]
  );

  const onKeyDown = useCallback(
    (key, e) => {
      if (e.key === "Enter" || e.key === "Escape") {
        updateFeatureValue(key, e);
        closeDialog(); // Close the dialog
      }
    },
    [updateFeatureValue, closeDialog]
  );

  const getHTML = (value, title = "") => (
    <div title={title || value}>{value}</div>
  );

  const getAreaHTML = (rowKey, value) => {
    const color =
      uiState.feature.protected_area < uiState.feature.target_area &&
        rowKey === "Area protected"
        ? "red"
        : "rgba(0, 0, 0, 0.6)";

    return (
      <div
        title={getArea(value, userData.report_units, false, 6)}
        style={{ color }}
      >
        {getArea(value, userData.report_units, true)}
      </div>
    );
  };

  const renderValueCell = (row) => {
    switch (row.key) {
      case "ID":
      case "Alias":
      case "Feature class name":
        return getHTML(row.value, row.hint);

      case "Description":
      case "Creation date":
        return getHTML(row.value);

      case "Mapbox ID":
        return row.value === "" || row.value === null
          ? getHTML("Not available", "The feature was not uploaded to Mapbox")
          : getHTML(
            row.value,
            "The feature was uploaded to Mapbox with this identifier"
          );

      case "Total area":
        return row.value === -1
          ? getHTML(
            "Not calculated",
            "Total areas are not available for imported projects"
          )
          : getAreaHTML(row.key, row.value);

      case "Total":
        return getHTML(row.value);

      case "Target percent":
      case "Species Penalty Factor":
        return userData.role === "ReadOnly" ? (
          <Typography>{row.value}</Typography>
        ) : (
          <div
            contentEditable
            suppressContentEditableWarning
            title="Click to edit"
            onBlur={(e) =>
              updateFeatureValue(
                row.key === "Target percent" ? "target_value" : "spf",
                e
              )
            }
            onKeyDown={(e) =>
              onKeyDown(
                row.key === "Target percent" ? "target_value" : "spf",
                e
              )
            }
          >
            {row.value}
          </div>
        );

      case "Preprocessed":
        return row.value
          ? getHTML(
            "Yes",
            "The feature has been intersected with the planning units"
          )
          : getHTML(
            "No",
            "The feature has not yet been intersected with the planning units"
          );

      case "Planning grid area":
      case "Target area":
      case "Area protected":
        return row.value === -1
          ? getHTML("Not calculated", "Calculated during processing")
          : getAreaHTML(row.key, row.value);

      case "Planning grid amount":
      case "Planning unit count":
      case "Target amount":
      case "Protected amount":
        return row.value === -1
          ? getHTML("Not calculated", "Calculated during pre-processing")
          : getHTML(row.value);

      default:
        return getHTML(row.value);
    }
  };

  if (!uiState.feature) {
    return null;
  }

  const isOldVersion = uiState.feature.old_version;
  // Select the appropriate feature properties based on the source
  const featureProperties =
    uiState.feature.source === "Imported shapefile"
      ? CONSTANTS.FEATURE_PROPERTIES_POLYGONS
      : CONSTANTS.FEATURE_PROPERTIES_POINTS;

  // Filter the items based on version compatibility
  const filteredProperties = featureProperties.filter((item) =>
    (isOldVersion && item.showForOld) || (!isOldVersion && item.showForNew)
  );

  // Map the filtered items to the desired structure
  const data = filteredProperties.map((item) => ({
    key: item.key,
    value: uiState.feature[item.name],
    hint: item.hint,
  }));


  return (
    <MarxanDialog
      open={featureStates.featureInfoDialogOpen}
      loading={loading}
      onOk={closeDialog}
      onCancel={closeDialog}
      title="Properties"
      contentWidth={380}
      offsetX={135}
      offsetY={250}
    >
      <TableContainer>
        <Table
          key="k9"
          size="small"
          className={uiState.feature.old_version ? "infoTableOldVersion" : "infoTable"}
        >
          <TableHead>
            <TableRow>
              <TableCell style={{ textAlign: "left", width: "150px" }}>
                Key
              </TableCell>
              <TableCell style={{ textAlign: "left", width: "185px" }}>
                Value
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.key}>
                <TableCell>{getHTML(row.key, row.hint)}</TableCell>
                <TableCell>{renderValueCell(row)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </MarxanDialog>
  );
};

export default FeatureInfoDialog;
