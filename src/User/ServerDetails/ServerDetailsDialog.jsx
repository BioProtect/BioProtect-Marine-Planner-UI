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

const ServerDetailsDialog = ({
  marxanServer,
  newWDPAVersion,
  registry,
  setUpdateWDPADialogOpen,
}) => {
  const dispatch = useDispatch();
  const dialogStates = useSelector((state) => state.ui.dialogStates);
  const renderWithIcon = (cellInfo) => {
    const newServerSoftware =
      cellInfo.key === "Marxan Server version" &&
      marxanServer.server_version !== registry.SERVER_VERSION;

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

  const data = marxanServer
    ? [
        { key: "Name", value: marxanServer.name },
        { key: "Description", value: marxanServer.description },
        { key: "Host", value: marxanServer.host },
        { key: "System", value: marxanServer.system },
        { key: "Processors", value: marxanServer.processor_count },
        { key: "Disk space", value: marxanServer.disk_space },
        { key: "RAM", value: marxanServer.ram },
        {
          key: "Marxan Server version",
          value: marxanServer.server_version,
        },
        { key: "WDPA version", value: marxanServer.wdpa_version },
        {
          key: "Planning grid units limit",
          value: marxanServer.planning_grid_units_limit,
        },
        {
          key: "Shutdown",
          value: marxanServer.shutdowntime
            ? new Date(marxanServer.shutdowntime).toLocaleString()
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
