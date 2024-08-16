import React, { useCallback, useEffect, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MarxanDialog from "./MarxanDialog";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";

const RunSettingsDialog = (props) => {
  const [data, setData] = useState([]);
  const [updateEnabled, setUpdateEnabled] = useState(false);

  useEffect(() => {
    if (props.runParams !== data) {
      setData(props.runParams);
    }
  }, [props.runParams, data]);

  const openParametersDialog = useCallback(() => {
    props.openParametersDialog();
  }, [props]);

  const updateRunParams = useCallback(() => {
    setUpdateEnabled(false);
    if (props.userRole !== "ReadOnly") {
      props.updateRunParams(data);
    }
    props.onOk();
  }, [props, data]);

  const enableUpdate = useCallback(() => {
    setUpdateEnabled(true);
  }, []);

  const handleBlur = useCallback(
    (e, index) => {
      const updatedData = [...data];
      updatedData[index].value = e.target.innerHTML;
      setData(updatedData);
    },
    [data]
  );

  const renderEditable = useCallback(
    (cellInfo) => {
      return props.userRole === "ReadOnly" ? (
        <div>{data[cellInfo.index]["value"]}</div>
      ) : (
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              backgroundColor: "#fafafa",
              float: data[cellInfo.index]["key"] === "BLM" ? "left" : "none",
              flexGrow: 1,
            }}
            contentEditable
            suppressContentEditableWarning
            onFocus={enableUpdate}
            onBlur={(e) => handleBlur(e, cellInfo.index)}
          >
            {data[cellInfo.index]["value"]}
          </div>
          {data[cellInfo.index]["key"] === "BLM" && (
            <FontAwesomeIcon
              icon={faExternalLinkAlt}
              onClick={props.showClumpingDialog}
              title="Click to open the BLM comparison dialog"
              style={{
                cursor: "pointer",
                marginLeft: "10px",
              }}
            />
          )}
        </div>
      );
    },
    [props.userRole, data, enableUpdate, handleBlur, props.showClumpingDialog]
  );

  return (
    <MarxanDialog
      {...props}
      fullWidth={false}
      maxWidth="md"
      onOk={updateRunParams}
      helpLink={"user.html#run-settings"}
      title="Run settings"
    >
      <Table aria-label="run settings table">
        <TableHead>
          <TableRow>
            <TableCell>Parameter</TableCell>
            <TableCell>Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.key}</TableCell>
              <TableCell>
                {renderEditable({ index, column: { id: "value" } })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </MarxanDialog>
  );
};

export default RunSettingsDialog;
