import React, { useCallback, useEffect, useState } from "react";
import { Tab, Table, TableBody, TableCell, TableRow, Tabs } from "@mui/material";

import CONSTANTS from "./constants";
import Swatch from "./Swatch";
import SyncIcon from "@mui/icons-material/Sync";
import { getArea } from "./Helpers";
import { useSelector } from "react-redux";

const TITLE_LINK = "Click to open in the Protected Planet website";
const URL_PP = "https://www.protectedplanet.net/";
const TAB_STYLE = {
  fontWeight: "normal",
  textTransform: "none",
  height: "34px",
  fontSize: "15px",
};

const IdentifyPopup = ({
  visible,
  xy,
  metadata,
  identifyProtectedAreas,
  hideIdentifyPopup,
  reportUnits,
}) => {
  const uiState = useSelector((state) => state.ui);
  const puState = useSelector((state) => state.planningUnit)
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
      hideIdentifyPopup();
      setSelectedTab("pu");
    }, 4000));
  }, [clearTimer, hideIdentifyPopup]);

  useEffect(() => {
    if (visible) {
      startTimer();
    }
    return () => clearTimer(); // Cleanup on unmount
  }, [visible]);

  useEffect(() => {
    if (visible) {
      startTimer();
    }
  }, [xy]);

  const getItemStatus = () => {
    if (!puState.identifyPlanningUnits?.puData) {
      return CONSTANTS.PU_STATUS_DEFAULT;
    }
    switch (puState.identifyPlanningUnits.puData.status) {
      case 2:
        return CONSTANTS.PU_STATUS_LOCKED_IN;
      case 3:
        return CONSTANTS.PU_STATUS_LOCKED_OUT;
      default:
        return CONSTANTS.PU_STATUS_DEFAULT;
    }
  };

  const renderArea = (amount, source) =>
    source !== "Imported shapefile (points)" ? (
      <div title={getArea(amount, reportUnits)}>{getArea(amount, reportUnits, true)}</div>
    ) : (
      <div title={amount}>{amount}</div>
    );

  const renderPAName = (name) => <div title={name}>{name}</div>;

  const renderPALink = (wdpaid) => (
    <span className="ppLink underline">
      <a
        href={`${URL_PP}${wdpaid}`}
        target="_blank"
        rel="noopener noreferrer"
        title={TITLE_LINK}
      >
        {wdpaid}
      </a>
    </span>
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
          <Swatch item={getItemStatus()} shape={metadata?.PLANNING_UNIT_NAME?.includes("hexagon") ? "hexagon" : "square"} />
          <span style={{ paddingLeft: "5px" }} />
          {getItemStatus().label}
        </span>
        <span>Cost: {puState.identifyPlanningUnits.puData.cost}</span>
        <span>ID: {puState.identifyPlanningUnits.puData.id}</span>
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
      {
        render: (row) => <div title={row.alias}>{row.alias}</div>,
      },
      {
        render: (row) => <div title={row.description}>{row.description}</div>,
      },
    ])
  );

  const protectedAreasTab = identifyProtectedAreas?.length > 0 && (
    renderTabContent(identifyProtectedAreas, [
      {
        render: (row) => renderPAName(row.properties.name),
      },
      {
        render: (row) => <div title={row.properties.desig}>{row.properties.desig}</div>,
      },
      {
        render: (row) => <div title={row.properties.iucn_cat}>{row.properties.iucn_cat}</div>,
      },
      {
        render: (row) => renderPALink(row.properties.wdpaid),
      },
    ])
  );

  return (
    <div
      style={{
        display: visible && (planningUnitTab || featuresTab || protectedAreasTab) ? "block" : "none",
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
        {protectedAreasTab && <Tab label="Protected Areas" value="pas" style={TAB_STYLE} />}
      </Tabs>
      <div>
        {selectedTab === "pu" && planningUnitTab}
        {selectedTab === "features" && featuresTab}
        {selectedTab === "pas" && protectedAreasTab}
      </div>
    </div>
  );
};

export default IdentifyPopup;
