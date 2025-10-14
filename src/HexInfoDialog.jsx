import React, { useCallback, useEffect, useState } from "react";
import { Tab, Table, TableBody, TableCell, TableRow, Tabs } from "@mui/material";
import {
  setIdentifyPlanningUnits,
  togglePUD,
} from "@slices/planningUnitSlice";

import CONSTANTS from "./constants";
import Swatch from "./Swatch";
import SyncIcon from "@mui/icons-material/Sync";
import { getArea } from "./Helpers";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";

const TAB_STYLE = {
  fontWeight: "normal",
  textTransform: "none",
  height: "34px",
  fontSize: "15px",
};

const HexInfoDialog = ({
  xy,
  metadata,
}) => {
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui);
  const puState = useSelector((state) => state.planningUnit)
  const userData = useSelector(selectCurrentUser);

  const hexInfoDialogOpen = puState.dialogs.hexInfoDialogOpen;
  const featureState = useSelector((state) => state.feature);
  const [selectedTab, setSelectedTab] = useState("pu");
  const [timer, setTimer] = useState(null);

  const clearTimer = useCallback(() => {
    if (timer) {
      clearTimeout(timer);
      setTimer(null);
    }
  }, [timer]);

  const startTimer = useCallback(() => {
    clearTimer(); // Ensure previous timer is cleared before setting a new one
    setTimer(setTimeout(() => {
      closeDialog();
      setSelectedTab("pu");
    }, 4000));
  }, [clearTimer, closeDialog]);

  useEffect(() => {
    if (hexInfoDialogOpen) {
      startTimer();
    }
    return () => clearTimer(); // Cleanup on unmount
  }, [hexInfoDialogOpen]);

  useEffect(() => {
    if (hexInfoDialogOpen) {
      startTimer();
    }
  }, [xy]);

  //hides the identify popup
  const closeDialog = (e) => {
    dispatch(togglePUD({ dialogName: "hexInfoDialogOpen", "isOpen": false }));
    dispatch(setIdentifyPlanningUnits({}));
  };

  const getItemStatus = () => {
    if (!puState.identifyPlanningUnits?.puData) {
      return CONSTANTS.PU_STATUS_DEFAULT;
    }
    switch (puState.identifyPlanningUnits.puData.status) {
      case 1:
        return CONSTANTS.PU_STATUS_LOCKED_IN;
      case 2:
        return CONSTANTS.PU_STATUS_LOCKED_OUT;
      default:
        return CONSTANTS.PU_STATUS_DEFAULT;
    }

  };

  const renderArea = (amount, source) =>
    source !== "Imported shapefile (points)" ? (
      <div title={getArea(amount, userData.reportUnits)}>{getArea(amount, userData.reportUnits, true)}</div>
    ) : (
      <div title={amount}>{amount}</div>
    );

  const renderTabContent = (data, columns) => (
    <Table>
      <TableBody>
        {data.map((row, index) => (
          <TableRow key={index}>
            {columns.map((col, colIndex) => (
              <TableCell key={colIndex}>{col.render(row)}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const planningUnitTab = puState.identifyPlanningUnits?.puData && (
    <div>
      <div className="identifyPlanningUnitsHeader">
        <span>
          <Swatch
            item={getItemStatus()}
            shape={metadata?.PLANNING_UNIT_NAME?.includes("hexagon") ? "hexagon" : "square"}
          />
          <span style={{ paddingLeft: "5px" }} />
          {getItemStatus().label}
        </span>
        <span>Cost: {Number(puState.identifyPlanningUnits.puData.cost)}</span>
        <span>
          H3: {puState.identifyPlanningUnits.puData.h3_index || puState.identifyPlanningUnits.puData.id}
        </span>
      </div>
      {puState.identifyPlanningUnits.features?.length > 0 ? (
        renderTabContent(puState.identifyPlanningUnits.features, [{
          render: (row) => <div title={row.alias}>{row.alias}</div>,
        }, {
          render: (row) => renderArea(row.amount, row.source),
        }])
      ) : (
        <div className="featureList">No features occur in this planning unit</div>
      )}
    </div>
  );

  const featuresTab = featureState.identifiedFeatures?.length > 0 && (
    renderTabContent(featureState.identifiedFeatures, [
      { render: (row) => <div title={row.alias}>{row.alias}</div> },
      { render: (row) => <div title={row.description}>{row.description}</div> },
    ])
  );

  return (
    <div
      style={{
        display: hexInfoDialogOpen && (planningUnitTab || featuresTab) ? "block" : "none",
        left: `${xy.x + 25}px`,
        top: `${xy.y - 25}px`,
      }}
      id="popup"
      onMouseEnter={clearTimer}
      onMouseLeave={startTimer}
    >
      <Tabs
        value={planningUnitTab ? selectedTab : "pas"}
        onChange={(_, newValue) => setSelectedTab(newValue)}
        aria-label="Identify Popup Tabs"
      >
        {planningUnitTab && <Tab label="Planning Units" value="pu" style={TAB_STYLE} />}
        {featuresTab && <Tab label="Features" value="features" style={TAB_STYLE} />}
      </Tabs>
      <div>
        {selectedTab === "pu" && planningUnitTab}
        {selectedTab === "features" && featuresTab}
      </div>
    </div>
  );
};

export default HexInfoDialog;
