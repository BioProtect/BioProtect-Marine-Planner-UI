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

import BPTableRow from "../BPComponents/BPTableRow";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MapContainer2 from "../MapContainer2";
import MarxanDialog from "../MarxanDialog";
import { getArea } from "../Helpers";
import { selectUserData } from "../slices/authSlice";
import { toggleFeatureDialog } from "../slices/uiSlice";

const FeatureDialog = ({
  loading,
  featureMetadata,
  getTilesetMetadata,
  getProjectList,
}) => {
  const dispatch = useDispatch();
  const featureDialogStates = useSelector(
    (state) => state.ui.featureDialogStates
  );
  const userData = useSelector(selectUserData);

  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => setExpanded(!expanded);

  const fetchProjectList = () => getProjectList(featureMetadata, "feature");

  // Determine unit type and value
  const isShapefile = featureMetadata.source === "Imported shapefile";
  const amount = isShapefile
    ? getArea(featureMetadata.area, userData.report_units, true)
    : featureMetadata.area;
  const unit = isShapefile ? "Area" : "Amount";

  const closeDialog = () =>
    dispatch(
      toggleFeatureDialog({
        dialogName: "featureDialogOpen",
        isOpen: false,
      })
    );

  return (
    <MarxanDialog
      open={featureDialogStates.featureDialogOpen}
      loading={loading}
      onOk={closeDialog}
      onClose={closeDialog}
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
              <BPTableRow val1={unit} val2={amount} />
              <BPTableRow
                val1="Created:"
                val2={featureMetadata.creation_date}
              />
              <BPTableRow
                val1="Created by:"
                val2={featureMetadata.created_by}
              />
              <BPTableRow val1="Source:" val2={featureMetadata.source} />
              {expanded && (
                <>
                  <BPTableRow val1="ID:" val2={featureMetadata.id} />
                  <BPTableRow
                    val1="guid:"
                    val2={featureMetadata.feature_class_name}
                  />
                  <BPTableRow
                    val1="tileset:"
                    val2={featureMetadata.tilesetid}
                  />
                  <BPTableRow
                    val1="Projects:"
                    val2={
                      <FontAwesomeIcon
                        icon="external-link-alt"
                        onClick={fetchProjectList}
                        title="View a list of projects that this feature is used in"
                        style={{ cursor: "pointer", paddingTop: "6px" }}
                      />
                    }
                  />
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
