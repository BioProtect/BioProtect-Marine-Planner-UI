import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MapContainer2 from "../MapContainer2";
import MarxanDialog from "../MarxanDialog";
import { getArea } from "../Helpers";
import { toggleFeatureDialog } from "../slices/uiSlice";

const FeatureDialog = ({
  loading,
  featureMetadata,
  getTilesetMetadata,
  getProjectList,
  reportUnits,
}) => {
  const dispatch = useDispatch();
  const featureDialogStates = useSelector(
    (state) => state.ui.featureDialogStates
  );

  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => setExpanded(!expanded);

  const fetchProjectList = () => {
    getProjectList(featureMetadata, "feature");
  };

  // Determine unit type and value
  const isShapefile = featureMetadata.source === "Imported shapefile";
  const amount = isShapefile
    ? getArea(featureMetadata.area, reportUnits, true)
    : featureMetadata.area;
  const unit = isShapefile ? "Area" : "Amount";

  return (
    <MarxanDialog
      open={featureDialogStates.featureDialogOpen}
      loading={loading}
      onOk={() =>
        dispatch(
          toggleFeatureDialog({
            dialogName: "featureDialogOpen",
            isOpen: false,
          })
        )
      }
      onClose={() =>
        dispatch(
          toggleFeatureDialog({
            dialogName: "featureDialogOpen",
            isOpen: false,
          })
        )
      }
      showCancelButton={false}
      title={featureMetadata.alias}
      contentWidth={768}
    >
      <Box>
        <MapContainer2
          planningGridMetadata={featureMetadata}
          getTilesetMetadata={getTilesetMetadata}
          color={featureMetadata.color}
          outlineColor="rgba(0, 0, 0, 0.2)"
        />
        <Box className="metadataPanel" mt={2}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell colSpan={2}>
                  <Typography variant="subtitle1">Description:</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={2}>
                  <Typography variant="body2">
                    {featureMetadata.description}
                  </Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{unit}:</TableCell>
                <TableCell>{amount}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Created:</TableCell>
                <TableCell>{featureMetadata.creation_date}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Created by:</TableCell>
                <TableCell>{featureMetadata.created_by}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Source:</TableCell>
                <TableCell>{featureMetadata.source}</TableCell>
              </TableRow>
              {expanded && (
                <>
                  <TableRow>
                    <TableCell>id:</TableCell>
                    <TableCell>{featureMetadata.id}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>guid:</TableCell>
                    <TableCell>{featureMetadata.feature_class_name}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>tileset:</TableCell>
                    <TableCell>{featureMetadata.tilesetid}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Projects:</TableCell>
                    <TableCell>
                      <FontAwesomeIcon
                        icon="external-link-alt"
                        onClick={fetchProjectList}
                        title="View a list of projects that this feature is used in"
                        style={{ cursor: "pointer", paddingTop: "6px" }}
                      />
                    </TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
          <Box mt={1}>
            <Button
              variant="text"
              onClick={toggleExpand}
              title={expanded ? "Show less details" : "Show more details"}
            >
              {expanded ? "less" : "more.."}
            </Button>
          </Box>
        </Box>
      </Box>
    </MarxanDialog>
  );
};

export default FeatureDialog;
