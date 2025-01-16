import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

import MarxanDialog from "../MarxanDialog";
import React from "react";
import { toggleProjectDialog } from "../slices/uiSlice";

const ProjectsListDialog = () => {
  const dispatch = useDispatch();
  const userData = useSelector(selectUserData);
  const projState = useSelector((state) => state.project);
  const projectDialogStates = useSelector(
    (state) => state.ui.projectDialogStates
  );
  // Determine the columns based on the user role
  const tableColumns = [
    ...(userData.userRole === "Admin"
      ? [{ Header: "User", accessor: "user", width: 90 }]
      : []),
    { Header: "Name", accessor: "name", width: 200 },
  ];

  // Render the content of a table cell for "Name"
  const renderName = (row) => (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#dadada",
        borderRadius: "2px",
      }}
      title={row.name}
    >
      {row.name}
    </div>
  );

  if (!projState.projectList) {
    return null;
  }

  const closeDialog = () =>
    dispatch(
      toggleProjectDialog({
        dialogName: "projectsListDialogOpen",
        isOpen: false,
      })
    );

  return (
    <MarxanDialog
      open={projectDialogStates.projectsListDialogOpen}
      showCancelButton={false}
      autoDetectWindowHeight={false}
      title={projState.projectListDialogTitle}
      contentWidth={500}
      helpLink={"user.html#projects-list"}
      onOk={() => closeDialog()}
    >
      <div style={{ marginBottom: "5px" }}>{projState.projectListDialogHeading}</div>
      <div id="failedProjectsTable">
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {tableColumns.map((col) => (
                  <TableCell
                    key={col.accessor}
                    style={{ textAlign: col.headerStyle?.textAlign || "left" }}
                  >
                    {col.Header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {projState.projectList.map((row, index) => (
                <TableRow key={index}>
                  {tableColumns.map((col) => (
                    <TableCell key={col.accessor}>
                      {col.accessor === "name"
                        ? renderName(row)
                        : row[col.accessor]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </MarxanDialog>
  );
};

export default ProjectsListDialog;
