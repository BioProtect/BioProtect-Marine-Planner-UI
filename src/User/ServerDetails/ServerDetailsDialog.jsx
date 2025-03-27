import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MarxanDialog from "../../MarxanDialog";
import React from "react";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { toggleDialog } from "../../slices/uiSlice";

const ServerDetailsDialog = ({ loading, newWDPAVersion, registry }) => {
  const dispatch = useDispatch();
  const dialogStates = useSelector((state) => state.ui.dialogStates);
  const projectState = useSelector((state) => state.project);
  const server = projectState.bpServer;
  const renderWithIcon = (cellInfo) => {
    const newServerSoftware =
      cellInfo.key === "Marxan Server version" &&
      server.server_version !== registry.SERVER_VERSION;

    return (
      <React.Fragment>
        <div style={{ float: "left" }}>{cellInfo.value}</div>
        {cellInfo.key === "Disk space" && (
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            title={"Disk space running low"}
          />
        )}
        {newServerSoftware && (
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            title={
              "A new version of Marxan Server is available (" +
              registry.SERVER_VERSION +
              ")"
            }
          />
        )}
        {cellInfo.key === "WDPA version" && (
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            title={"A new version of the WDPA is available - click for details"}
            onClick={() =>
              dispatch(
                toggleDialog({
                  dialogName: "updateWDPADialogOpen",
                  isOpen: true,
                })
              )
            }
          />
        )}
      </React.Fragment>
    );
  };

  const data = server
    ? [
        { key: "Name", value: server.name },
        { key: "Description", value: server.description },
        { key: "Host", value: server.host },
        { key: "System", value: server.system },
        { key: "Processors", value: server.processor_count },
        { key: "Disk space", value: server.disk_space },
        { key: "RAM", value: server.ram },
        {
          key: "Marxan Server version",
          value: server.server_version,
        },
        { key: "WDPA version", value: server.wdpa_version },
        {
          key: "Planning grid units limit",
          value: server.planning_grid_units_limit,
        },
        {
          key: "Shutdown",
          value: server.shutdowntime
            ? new Date(server.shutdowntime).toLocaleString()
            : "Never",
        },
      ]
    : [];

  const closeDialog = () =>
    dispatch(
      toggleDialog({ dialogName: "serverDetailsDialogOpen", isOpen: false })
    );

  return (
    <MarxanDialog
      loading={loading}
      open={dialogStates.serverDetailsDialogOpen}
      onOk={() => closeDialog()}
      onCancel={() => closeDialog()}
      onClose={() => closeDialog()}
      contentWidth={445}
      offsetY={80}
      title="Server Details"
      helpLink={"user.html#server-details"}
    >
      <TableContainer>
        <Table>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.key}>
                <TableCell style={{ width: "144px", textAlign: "left" }}>
                  {row.key}
                </TableCell>
                <TableCell style={{ width: "252px", textAlign: "left" }}>
                  {renderWithIcon(row)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </MarxanDialog>
  );
};

export default ServerDetailsDialog;
