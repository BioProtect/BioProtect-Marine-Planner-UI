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

import CONSTANTS from "../constants";
import MarxanDialog from "../MarxanDialog";

const FeatureInfoDialog = ({
  feature,
  userRole,
  updateFeature,
  reportUnits,
  onOk,
  ...props
}) => {
  const updateFeatureValue = useCallback(
    (key, e) => {
      const value = e.currentTarget.textContent;
      if (
        (key === "target_value" && isValidTargetValue(value)) ||
        (key === "spf" && isNumber(value))
      ) {
        const updatedProps = { [key]: value };
        updateFeature(feature, updatedProps);
      } else {
        alert("Invalid value");
      }
    },
    [feature, updateFeature]
  );

  const onKeyDown = useCallback(
    (key, e) => {
      if (e.key === "Enter" || e.key === "Escape") {
        updateFeatureValue(key, e);
        onOk(); // Close the dialog
      }
    },
    [updateFeatureValue, onOk]
  );

  const getHTML = (value, title = "") => (
    <div title={title || value}>{value}</div>
  );

  const getAreaHTML = (rowKey, value) => {
    const color =
      feature.protected_area < feature.target_area &&
      rowKey === "Area protected"
        ? "red"
        : "rgba(0, 0, 0, 0.6)";

    return (
      <div title={getArea(value, reportUnits, false, 6)} style={{ color }}>
        {getArea(value, reportUnits, true)}
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
        return userRole === "ReadOnly" ? (
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

  if (!feature) {
    return null;
  }

  const data = (
    feature.source === "Imported shapefile"
      ? CONSTANTS.FEATURE_PROPERTIES_POLYGONS
      : CONSTANTS.FEATURE_PROPERTIES_POINTS
  )
    .filter((item) => {
      if (!feature.old_version && item.showForNew) return true;
      if (feature.old_version && item.showForOld) return true;
      return false;
    })
    .map((item) => ({
      key: item.key,
      value: feature[item.name],
      hint: item.hint,
    }));

  return (
    <MarxanDialog
      title="Properties"
      {...props}
      contentWidth={380}
      helpLink="user.html#feature-properties-window"
      offsetX={135}
      offsetY={250}
    >
      <TableContainer>
        <Table
          key="k9"
          size="small"
          className={feature.old_version ? "infoTableOldVersion" : "infoTable"}
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
