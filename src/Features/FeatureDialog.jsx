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
import { toggleFeatureD } from "../slices/featureSlice";

const FeatureDialog = ({
  loading,
  getTilesetMetadata,
  getProjectList,
}) => {
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui);
  const featureDialogStates = useSelector(
    (state) => state.ui.featureDialogStates
  );
  const userData = useSelector(selectUserData);

  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => setExpanded(!expanded);

  const fetchProjectList = () => getProjectList(uiState.featureMetadata, "feature");

  // Determine unit type and value
  const isShapefile = uiState.featureMetadata.source === "Imported shapefile";
  const amount = isShapefile
    ? getArea(uiState.featureMetadata.area, userData.report_units, true)
    : uiState.featureMetadata.area;
  const unit = isShapefile ? "Area" : "Amount";

  const closeDialog = () =>
    dispatch(
      toggleFeatureD({
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
      title={uiState.featureMetadata.alias}
      contentWidth={768}
    >
      <Box>
        <MapContainer2
          planningGridMetadata={uiState.featureMetadata}
          getTilesetMetadata={getTilesetMetadata}
          color={uiState.featureMetadata.color}
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
                    {uiState.featureMetadata.description}
                  </Typography>
                </TableCell>
              </TableRow>
              <BPTableRow val1={unit} val2={amount} />
              <BPTableRow
                val1="Created:"
                val2={uiState.featureMetadata.creation_date}
              />
              <BPTableRow
                val1="Created by:"
                val2={uiState.featureMetadata.created_by}
              />
              <BPTableRow val1="Source:" val2={uiState.featureMetadata.source} />
              {expanded && (
                <>
                  <BPTableRow val1="ID:" val2={uiState.featureMetadata.id} />
                  <BPTableRow
                    val1="guid:"
                    val2={uiState.featureMetadata.feature_class_name}
                  />
                  <BPTableRow
                    val1="tileset:"
                    val2={uiState.featureMetadata.tilesetid}
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
