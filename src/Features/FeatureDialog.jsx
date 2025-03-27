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
import { setProjectList, setProjectListDialogHeading, setProjectListDialogTitle, toggleProjDialog } from "../slices/projectSlice";
import { useDispatch, useSelector } from "react-redux";

import BPTableRow from "../BPComponents/BPTableRow";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MapContainer2 from "../MapContainer2";
import MarxanDialog from "../MarxanDialog";
import { getArea } from "../Helpers";
import { selectCurrentUser } from "../slices/authSlice";
import { toggleFeatureD } from "../slices/featureSlice";
import { useListFeatureProjectsQuery } from "../slices/featureSlice";

const FeatureDialog = ({ loading, getTilesetMetadata }) => {
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui);
  const featureState = useSelector((state) => state.feature);
  const featureDialogs = useSelector((state) => state.feature.dialogs);
  const userData = useSelector(selectCurrentUser);

  const { data: featureProjectsData, isLoading: isFeatureProjectsLoading } = useListFeatureProjectsQuery(featureState.featureMetadata.id);
  const projects = featureProjectsData?.projects || [];


  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => setExpanded(!expanded);

  const fetchProjectList = () => {
    dispatch(setProjectList(projects));
    dispatch(setProjectListDialogHeading("Projects list"));
    dispatch(setProjectListDialogTitle("The feature is used in the following projects:"));
    dispatch(
      toggleProjDialog({
        dialogName: "projectsListDialogOpen",
        isOpen: true,
      })
    );
  }

  // Determine unit type and value
  const isShapefile = featureState.featureMetadata.source === "Imported shapefile";
  const amount = isShapefile
    ? getArea(featureState.featureMetadata.area, userData.report_units, true)
    : featureState.featureMetadata.area;
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
      open={featureDialogs.featureDialogOpen}
      loading={loading}
      onOk={closeDialog}
      onClose={closeDialog}
      showCancelButton={false}
      title={featureState.featureMetadata.alias}
      contentWidth={768}
    >
      <Box>
        <MapContainer2
          planningGridMetadata={featureState.featureMetadata}
          getTilesetMetadata={getTilesetMetadata}
          color={featureState.featureMetadata.color}
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
                    {featureState.featureMetadata.description}
                  </Typography>
                </TableCell>
              </TableRow>
              <BPTableRow val1={unit} val2={amount} />
              <BPTableRow
                val1="Created:"
                val2={featureState.featureMetadata.creation_date}
              />
              <BPTableRow
                val1="Created by:"
                val2={featureState.featureMetadata.created_by}
              />
              <BPTableRow val1="Source:" val2={featureState.featureMetadata.source} />
              {expanded && (
                <>
                  <BPTableRow val1="ID:" val2={featureState.featureMetadata.id} />
                  <BPTableRow
                    val1="guid:"
                    val2={featureState.featureMetadata.feature_class_name}
                  />
                  <BPTableRow
                    val1="tileset:"
                    val2={featureState.featureMetadata.tilesetid}
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
