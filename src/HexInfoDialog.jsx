import {
  Box,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tabs,
  Typography,
} from "@mui/material";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { setIdentifyPlanningUnits, togglePUD } from "@slices/planningUnitSlice";
import { useDispatch, useSelector } from "react-redux";

import CONSTANTS from "./constants";
import Swatch from "./Swatch";
import { getArea } from "./Helpers";
import { selectCurrentUser } from "@slices/authSlice";

const HexInfoDialog = ({ xy, metadata }) => {
  const dispatch = useDispatch();
  const puState = useSelector((state) => state.planningUnit);
  const featureState = useSelector((state) => state.feature);
  const userData = useSelector(selectCurrentUser);

  const { hexInfoDialogOpen } = puState.dialogs;
  const puInfo = puState.identifyPlanningUnits?.puData;
  const puFeatures = puState.identifyPlanningUnits?.features || [];
  const identifiedFeatures = featureState.identifiedFeatures || [];

  const [popupPos, setPopupPos] = useState(xy);

  useLayoutEffect(() => {
    if (!xy) return;

    const PADDING = 20; // space between popup and window edges
    const popupWidth = 500;
    const popupHeight = 420;

    let left = xy.x + 25;
    let top = xy.y - 25;

    // Adjust if it overflows right edge
    if (left + popupWidth + PADDING > window.innerWidth) {
      left = Math.max(PADDING, window.innerWidth - popupWidth - PADDING);
    }

    // Adjust if it overflows bottom edge
    if (top + popupHeight + PADDING > window.innerHeight) {
      top = Math.max(PADDING, window.innerHeight - popupHeight - PADDING);
    }

    // Prevent going off top edge
    if (top < PADDING) top = PADDING;

    setPopupPos({ left, top });
  }, [xy]);

  // Automatically decide which tab should be shown first
  const [selectedTab, setSelectedTab] = useState(puInfo ? "pu" : "features");
  useEffect(() => {
    if (!puInfo && identifiedFeatures.length > 0) setSelectedTab("features");
    if (puInfo && puFeatures.length > 0) setSelectedTab("pu");
  }, [puInfo, puFeatures, identifiedFeatures]);

  const closeDialog = useCallback(() => {
    dispatch(togglePUD({ dialogName: "hexInfoDialogOpen", isOpen: false }));
    dispatch(setIdentifyPlanningUnits({}));
  }, [dispatch]);

  const puStatus = useMemo(() => {
    if (!puInfo) return CONSTANTS.PU_STATUS_DEFAULT;
    switch (puInfo.status) {
      case 1:
        return CONSTANTS.PU_STATUS_LOCKED_IN;
      case 2:
        return CONSTANTS.PU_STATUS_LOCKED_OUT;
      default:
        return CONSTANTS.PU_STATUS_DEFAULT;
    }
  }, [puInfo]);

  const renderArea = (amount) => {
    return amount == null ? (
      <Typography color="text.secondary" variant="caption">
        Not processed yet
      </Typography>
    ) : (
      <Typography
        variant="body2"
        title={getArea(amount, userData?.report_units)}
      >
        {getArea(amount, userData?.report_units, true)}
      </Typography>
    );
  };

  const renderTable = (rows, columns) => {
    return (
      <Table
        size="small"
        stickyHeader
        sx={{
          width: "100%",
          tableLayout: "auto",
          borderCollapse: "collapse",
          "& td, & th": {
            verticalAlign: "top",
            borderBottom: "1px solid #f0f0f0",
            padding: "4px 8px",
          },
        }}
      >
        <TableBody>
          {rows.map((row, idx) => (
            <TableRow key={idx} hover>
              {columns.map((col, i) => (
                <TableCell
                  key={i}
                  sx={{
                    "&:first-of-type": {
                      whiteSpace: "normal", // 👈 wrapping allowed
                      wordBreak: "break-word", // 👈 long words break properly
                      maxWidth: "260px", // 👈 constrain width so it wraps, not stretches table
                    },
                    "&:not(:first-of-type)": {
                      whiteSpace: "nowrap", // 👈 keep area column compact
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      maxWidth: "100px",
                      textAlign: "right",
                    },
                  }}
                >
                  {col.render(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  /** TAB: Planning Unit */
  const PlanningUnitTab = puInfo ? (
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.2,
          border: "1px solid #eee",
          borderRadius: 2,
          p: 1.5,
        }}
      >
        {/* Row 1: Hex ID */}
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="body2" color="text.secondary">
            Hex ID
          </Typography>
          <Typography variant="body2" fontWeight={500}>
            {puInfo.h3_index || puInfo.id}
          </Typography>
        </Box>

        {/* Row 2: Cost */}
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="body2" color="text.secondary">
            Cost
          </Typography>
          <Typography variant="body2" fontWeight={500}>
            {puInfo.cost?.toFixed(3)}
          </Typography>
        </Box>

        {/* Row 3: Locked Out */}
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="body2" fontWeight={500}>
            {puStatus.label}
          </Typography>
          <Swatch
            item={puStatus}
            shape={
              metadata?.PLANNING_UNIT_NAME?.includes("hexagon")
                ? "hexagon"
                : "square"
            }
          />
        </Box>
      </Box>
    </Box>
  ) : (
    <Box sx={{ p: 2, textAlign: "center" }}>
      <Typography color="text.secondary">
        No planning unit data available.
      </Typography>
    </Box>
  );

  /** TAB: Features */
  const FeaturesTab =
    puFeatures.length > 0 ? (
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            maxHeight: 300,
            overflowY: "auto",
            overflowX: "hidden",
            border: "1px solid #eee",
            borderRadius: 1,
            width: "100%",
          }}
        >
          {renderTable(puFeatures, [
            {
              render: (row) => (
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: "normal", // 👈 ensure wrapping inside Typography too
                    wordBreak: "break-word",
                  }}
                >
                  {row.feature_name}
                </Typography>
              ),
            },
            { render: (row) => renderArea(row.amount) },
          ])}
        </Box>
      </Box>
    ) : (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography color="text.secondary">
          No nearby features identified.
        </Typography>
      </Box>
    );

  if (!hexInfoDialogOpen) return null;

  return (
    <Box
      id="popup"
      sx={{
        position: "absolute",
        left: popupPos.left,
        top: popupPos.top,
        backgroundColor: "white",
        border: "1px solid #ccc",
        borderRadius: 2,
        boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
        zIndex: 1000,
        maxWidth: 500,
        maxHeight: 420,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden", // keeps content contained
      }}
    >
      {/* Tabs Header */}
      <Tabs
        value={selectedTab}
        onChange={(_, val) => setSelectedTab(val)}
        variant="fullWidth"
        textColor="primary"
        indicatorColor="primary"
        sx={{ minHeight: 34, borderBottom: "1px solid #eee" }}
      >
        <Tab label="Planning Unit" value="pu" />
        <Tab label="Features" value="features" />
      </Tabs>

      {/* Tab content */}
      <Box sx={{ flexGrow: 1, overflow: "auto" }}>
        {selectedTab === "pu" && PlanningUnitTab}
        {selectedTab === "features" && FeaturesTab}
      </Box>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          mt: 0.5,
          textAlign: "right",
          cursor: "pointer",
          userSelect: "none",
          px: 1.5,
          pb: 0.5,
        }}
        onClick={closeDialog}
      >
        ✕ Close
      </Typography>
    </Box>
  );
};

export default HexInfoDialog;
