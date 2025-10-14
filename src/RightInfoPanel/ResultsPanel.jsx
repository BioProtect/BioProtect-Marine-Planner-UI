import React, { useEffect, useMemo, useRef, useState } from "react";

import Button from "@mui/material/Button";
import Clipboard from "@mui/icons-material/Assignment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Log from "../Log";
import MapLegend from "./MapLegend";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Sync from "@mui/icons-material/Sync";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import Tabs from "@mui/material/Tabs";
import { faEraser } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";

let runtime = 0;
const activeTabArr = ["legend", "solutions", "log"];

const ResultsPanel = (props) => {
  const uiState = useSelector((state) => state.ui);

  const [showClipboard, setShowClipboard] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState(undefined);
  const [runtimeStr, setRuntimeStr] = useState("00:00s");
  const [timer, setTimer] = useState(null);
  const [currentTabIndex, setCurrentTabIndex] = useState(
    activeTabArr.indexOf(props.activeResultsTab) || 0
  );


  const prevProps = useRef();
  useEffect(() => {
    prevProps.current = props;
  });

  useEffect(() => {
    const objDiv = document.getElementById("log");
    if (objDiv) objDiv.scrollTop = objDiv.scrollHeight;

    if (props.solutions !== prevProps.solutions) {
      resetSolution(); // Unselect a solution
    }

    if (props.preprocessing && !prevProps.preprocessing) {
      startTimer();
    }

    if (!props.preprocessing && prevProps.preprocessing) {
      stopTimer();
    }
  }, [props, prevProps]);

  const strPadLeft = (string, pad, length) => {
    return (new Array(length + 1).join(pad) + string).slice(-length);
  };

  const startTimer = () => {
    runtime = 0;
    const newTimer = setInterval(() => {
      const minutes = Math.floor(runtime / 60);
      const seconds = runtime - minutes * 60;
      const finalTime =
        strPadLeft(minutes, "0", 2) + ":" + strPadLeft(seconds, "0", 2);
      setRuntimeStr(finalTime);
      runtime += 1;
    }, 1000);
    setTimer(newTimer);
  };

  const stopTimer = () => {
    clearInterval(timer);
    setTimer(null);
  };

  const loadSolution = (solution) => {
    props.loadSolution(solution, uiState.owner);
  };

  const resetSolution = () => {
    if (selectedSolution) changeSolution(undefined);
  };

  const changeSolution = (solution) => {
    setSelectedSolution(solution);
    if (solution) loadSolution(solution.Run_Number);
  };

  const mouseEnter = () => {
    setShowClipboard(true);
  };

  const mouseLeave = (event) => {
    if (event.relatedTarget.id !== "buttonsDiv") setShowClipboard(false);
  };

  const selectText = (node) => {
    node = document.getElementById(node);
    if (document.body.createTextRange) {
      const range = document.body.createTextRange();
      range.moveToElementText(node);
      range.select();
    } else if (window.getSelection) {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(node);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      console.warn("Could not select text in node: Unsupported browser.");
    }
  };

  const copyLog = (evt) => {
    selectText("log");
    evt.target.focus();
    document.execCommand("copy");
  };

  const handleTabChange = (evt, tabIndex) => {
    setCurrentTabIndex(tabIndex);
    props.setActiveTab(activeTabArr[tabIndex]);
  };

  const panelStyle = useMemo(() => ({
    top: "60px",
    width: "300px",
    height: "400px",
    position: "absolute",
    right: "140px",
  }), [])

  const displayStyle = {
    display: uiState.dialogStates.resultsPanelOpen ? "block" : "none",
  };

  const combinedDisplayStyles = { ...panelStyle, ...displayStyle };


  return (
    <React.Fragment>
      <div className="resultsPanel" style={combinedDisplayStyles}>
        <Paper elevation={2} className="ResultsPanelPaper" mb={4}>
          <div className="resultsTitle">Results</div>
          <Tabs value={currentTabIndex} onChange={handleTabChange} centered>
            <Tab
              label="Legend"
              value={0}
              disabled={props.puEditing ? true : false}
            />
            <Tab
              label="Solutions"
              value={1}
              disabled={props.puEditing ? true : false}
            />
            <Tab label="Log" value={2} />
          </Tabs>
          {currentTabIndex === 0 && (
            <div className="legendTab">
              <MapLegend {...props} brew={props.brew} />
            </div>
          )}
          {currentTabIndex === 1 && (
            <div
              id="solutionsPanel"
              style={{ display: !props.processing ? "block" : "none" }}
            >
              {props.solutions && props.solutions.length > 0 ? (
                <Table
                  data={props.solutions}
                  columns={[
                    {
                      Header: "Run",
                      accessor: "Run_Number",
                      width: 40,
                      headerStyle: { textAlign: "left" },
                    },
                    {
                      Header: "Score",
                      accessor: "Score",
                      width: 80,
                      headerStyle: { textAlign: "left" },
                    },
                    {
                      Header: "Cost",
                      accessor: "Cost",
                      width: 80,
                      headerStyle: { textAlign: "left" },
                    },
                    {
                      Header: "Planning Units",
                      accessor: "Planning_Units",
                      width: 50,
                      headerStyle: { textAlign: "left" },
                    },
                    {
                      Header: "Missing Values",
                      accessor: "Missing_Values",
                      width: 105,
                      headerStyle: { textAlign: "left" },
                    },
                  ]}
                  getTrProps={(state, rowInfo) => ({
                    onClick: () => changeSolution(rowInfo.original),
                    style: {
                      background:
                        rowInfo.original.Run_Number ===
                          (selectedSolution && selectedSolution.Run_Number)
                          ? "aliceblue"
                          : "",
                    },
                    title: "Click to show on the map",
                  })}
                  showPagination={false}
                  minRows={0}
                  pageSize={props.solutions.length}
                  noDataText=""
                  className="solutions_infoTable -highlight"
                />
              ) : null}
            </div>
          )}
          {currentTabIndex === 2 && (
            <div
              style={{
                display: props.userRole === "ReadOnly" ? "none" : "block",
              }}
            >
              <Log
                messages={uiState.importLog}
                id="log"
                mouseEnter={mouseEnter}
                mouseLeave={mouseLeave}
                preprocessing={props.preprocessing}
              />
              <Stack
                direction="row"
                spacing={1}
                justifyContent="center"
                alignItems="center"
                pb={2}
                pt={2}
              >
                <Button
                  variant="contained"
                  startIcon={
                    <Clipboard style={{ height: "20px", width: "20px" }} />
                  }
                  title="Copy to clipboard"
                  onClick={copyLog}
                  show={showClipboard}
                />
                <Button
                  variant="contained"
                  startIcon={<FontAwesomeIcon icon={faEraser} />}
                  title="Clear log"
                  onClick={props.clearLog}
                  show={showClipboard}
                />
              </Stack>
              <div
                className="runtime"
                style={{ display: props.preprocessing ? "block" : "none" }}
              >
                Runtime: {runtimeStr}s
              </div>
            </div>
          )}

          <div
            className="processingDiv"
            style={{ display: props.preprocessing ? "block" : "none" }}
            title="Processing.."
          >
            <Paper elevation={2}>
              <div className="processingText"></div>
              <Sync
                className="spin processingSpin"
                style={{ color: "rgb(255, 64, 129)" }}
              />
            </Paper>
          </div>
        </Paper>
      </div>
    </React.Fragment>
  );
};

export default ResultsPanel;
