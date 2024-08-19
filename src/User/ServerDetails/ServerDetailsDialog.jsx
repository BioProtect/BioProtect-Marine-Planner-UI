import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@mui/material";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MarxanDialog from "../../MarxanDialog";
import React from "react";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

/*
 * Copyright (c) 2020 Andrew Cottam.
 *
 * This file is part of marxanweb/marxan-client
 * (see https://github.com/marxanweb/marxan-client).
 *
 * License: European Union Public Licence V. 1.2, see https://opensource.org/licenses/EUPL-1.2
 */

const ServerDetailsDialog = (props) => {
  console.log("props ", props);
  const renderWithIcon = (cellInfo) => {
    const newServerSoftware =
      cellInfo.key === "Marxan Server version" &&
      props.marxanServer.server_version !== props.registry.SERVER_VERSION;

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
              props.registry.SERVER_VERSION +
              ")"
            }
          />
        )}
        {cellInfo.key === "WDPA version" && (
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            title={"A new version of the WDPA is available - click for details"}
            onClick={() => props.updateState({ updateWDPADialogOpen: true })}
          />
        )}
      </React.Fragment>
    );
  };

  const data = props.marxanServer
    ? [
        { key: "Name", value: props.marxanServer.name },
        { key: "Description", value: props.marxanServer.description },
        { key: "Host", value: props.marxanServer.host },
        { key: "System", value: props.marxanServer.system },
        { key: "Processors", value: props.marxanServer.processor_count },
        { key: "Disk space", value: props.marxanServer.disk_space },
        { key: "RAM", value: props.marxanServer.ram },
        {
          key: "Marxan Server version",
          value: props.marxanServer.server_version,
        },
        { key: "WDPA version", value: props.marxanServer.wdpa_version },
        {
          key: "Planning grid units limit",
          value: props.marxanServer.planning_grid_units_limit,
        },
        {
          key: "Shutdown",
          value: props.marxanServer.shutdowntime
            ? new Date(props.marxanServer.shutdowntime).toLocaleString()
            : "Never",
        },
      ]
    : [];

  return (
    <MarxanDialog
      {...props}
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
