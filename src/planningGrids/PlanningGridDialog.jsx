import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useCallback, useState } from "react";
import { setProjectList, setProjectListDialogHeading, setProjectListDialogTitle, toggleProjDialog } from "@slices/projectSlice";
import { useDispatch, useSelector } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MapContainer2 from "../MapContainer2";
import MarxanDialog from "../MarxanDialog";
import { togglePUD } from "@slices/planningUnitSlice";

const PlanningGridDialog = ({
  planningGridMetadata,
  getTilesetMetadata,
  getProjectList,
}) => {
  const dispatch = useDispatch();
  const puState = useSelector((state) => state.planningUnit);
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const handleProjectListClick = useCallback(() => {
    getProjectList(planningGridMetadata, "planning_grid");
  }, [getProjectList, planningGridMetadata]);

  const closeDialog = () =>
    dispatch(
      togglePUD({
        dialogName: "planningGridDialogOpen",
        isOpen: false,
      })
    );

  return (
    <div>
      <MarxanDialog
        open={puState.dialogs.planningGridDialogOpen}
        onOk={() => closeDialog()}
        onClose={() => closeDialog()}
        showCancelButton={false}
        title={planningGridMetadata.alias}
        helpLink={"user.html#the-planning-grid-details-window"}
        contentWidth={768}
      >
        <MapContainer2
          planningGridMetadata={planningGridMetadata}
          getTilesetMetadata={getTilesetMetadata}
        />
        <Box mt={3}>
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
                    {planningGridMetadata.description}
                  </Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Country:</TableCell>
                <TableCell>{planningGridMetadata.country}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Domain:</TableCell>
                <TableCell>{planningGridMetadata.domain}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Area:</TableCell>
                <TableCell>
                  {planningGridMetadata._area
                    ? `${planningGridMetadata._area} Km²`
                    : "-"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Unit count:</TableCell>
                <TableCell>
                  {planningGridMetadata.planning_unit_count}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Created:</TableCell>
                <TableCell>{planningGridMetadata.creation_date}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Created by:</TableCell>
                <TableCell>{planningGridMetadata.created_by}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Source:</TableCell>
                <TableCell>{planningGridMetadata.source}</TableCell>
              </TableRow>
              {expanded && (
                <>
                  <TableRow>
                    <TableCell>aoi_id:</TableCell>
                    <TableCell>{planningGridMetadata.aoi_id}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>tilesetid:</TableCell>
                    <TableCell>{planningGridMetadata.tilesetid}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Projects:</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={handleProjectListClick}
                        title="View a list of projects that this planning grid is used in"
                      >
                        <FontAwesomeIcon icon="external-link-alt" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
          <Typography
            variant="body2"
            component="div"
            onClick={toggleExpanded}
            style={{ cursor: "pointer", color: "blue", marginTop: 10 }}
          >
            {expanded ? "Show less details" : "Show more details"}
          </Typography>
          <Typography variant="caption" display="block" mt={2}>
            You may need to zoom in to see the planning grid units.
          </Typography>
        </Box>
      </MarxanDialog>
    </div>
  );
};

export default PlanningGridDialog;
