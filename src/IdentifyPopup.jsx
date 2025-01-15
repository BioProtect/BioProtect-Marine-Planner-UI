import React, { useCallback, useEffect, useState } from "react";
import { Tab, Table, TableBody, TableCell, TableRow, Tabs } from "@mui/material";

import CONSTANTS from "./constants";
import Swatch from "./Swatch";
import SyncIcon from "@mui/icons-material/Sync";
import { getArea } from "./Helpers";
import { selectUserData } from "./slices/authSlice";
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
  identifyPlanningUnits,
  identifyFeatures,
  identifyProtectedAreas,
  hideIdentifyPopup,
}) => {
  const [selectedTab, setSelectedTab] = useState("pu");
  const [timer, setTimer] = useState(null);
  const userData = useSelector(selectUserData);
  const clearTimer = useCallback(() => {
    if (timer) {
      clearTimeout(timer);
      setTimer(null);
    }
  }, [timer]);

  const startTimer = useCallback(() => {
    clearTimer();
    const timeout = setTimeout(() => {
      hideIdentifyPopup();
      setSelectedTab("pu");
    }, 4000);
    setTimer(timeout);
  }, [clearTimer, hideIdentifyPopup]);

  useEffect(() => {
    if (visible) {
      startTimer();
    }
    return clearTimer;
  }, [visible, startTimer, clearTimer]);

  useEffect(() => {
    clearTimer();
    startTimer();
  }, [xy, clearTimer, startTimer]);

  const getItemStatus = () => {
    if (!identifyPlanningUnits?.puData) {
      return CONSTANTS.PU_STATUS_DEFAULT;
    }
    switch (identifyPlanningUnits.puData.status) {
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
      <div title={getArea(amount, userData.report_units)}>{getArea(amount, userData.report_units, true)}</div>
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

  const planningUnitTab = identifyPlanningUnits?.puData && (
    <div>
      <div className="identifyPlanningUnitsHeader">
        <span>
          <Swatch item={getItemStatus()} shape={metadata?.PLANNING_UNIT_NAME?.includes("hexagon") ? "hexagon" : "square"} />
          <span style={{ paddingLeft: "5px" }} />
          {getItemStatus().label}
        </span>
        <span>Cost: {identifyPlanningUnits.puData.cost}</span>
        <span>ID: {identifyPlanningUnits.puData.id}</span>
      </div>
      {identifyPlanningUnits.features?.length > 0 ? (
        renderTabContent(identifyPlanningUnits.features, [
          {
            render: (row) => <div title={row.alias}>{row.alias}</div>,
          },
          {
            render: (row) => renderArea(row.amount, row.source),
          },
        ])
      ) : (
        <div className="featureList">No features occur in this planning unit</div>
      )}
    </div>
  );

  const featuresTab = identifyFeatures?.length > 0 && (
    renderTabContent(identifyFeatures, [
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
