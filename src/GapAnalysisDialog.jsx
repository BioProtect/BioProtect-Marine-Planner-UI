import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Label,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Box,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import CustomTooltip from "./CustomTooltip";
import MarxanDialog from "./MarxanDialog";
import MetChart from "./MetChart";
import { toggleDialog } from "./slices/uiSlice";

const GapAnalysisDialog = ({
  setGapAnalysis,
  gapAnalysis,
  preprocessing,
  projectFeatures,
  metadata,
  marxanServer,
  reportUnits,
}) => {
  const dispatch = useDispatch();
  const dialogStates = useSelector((state) => state.ui.dialogStates);
  const [showChart, setShowChart] = useState(false);

  const getRepresentationScore = (features) => {
    let sum = 0;
    let amountUnderProtectionProperty, totalAmountProperty;

    if (features.length) {
      if (features[0].hasOwnProperty("current_protected_area")) {
        amountUnderProtectionProperty = "current_protected_area";
        totalAmountProperty = "country_area";
      } else {
        amountUnderProtectionProperty = "protected_area";
        totalAmountProperty = "pu_area";
      }
    }

    features.forEach((item) => {
      const val =
        item[amountUnderProtectionProperty] /
        item[totalAmountProperty] /
        (item.target_value / 100);

      if (!isNaN(val)) sum += val > 1 ? 1 : val;
    });

    return Number((sum / features.length) * 100).toFixed(1);
  };

  const preparedData = useMemo(() => {
    let data = gapAnalysis.map((item) => {
      const stats = projectFeatures.find(
        (feature) => feature.feature_class_name === item._feature_class_name
      );

      return stats
        ? { ...item, target_value: stats.target_value, color: stats.color }
        : item;
    });

    data.sort((a, b) =>
      a.current_protected_percent < b.current_protected_percent ? -1 : 1
    );

    return data.filter((item) => item.country_area > 0);
  }, [gapAnalysis, projectFeatures]);

  const targetsMetCount = preparedData.filter(
    (item) => item.current_protected_percent >= item.target_value
  ).length;

  const charts = preparedData.map((item) => (
    <MetChart
      {...item}
      title={item._alias}
      color={item.color}
      key={item._feature_class_name}
      reportUnits={reportUnits}
      showCountryArea={false}
      dataKey={item._feature_class_name}
    />
  ));

  const representationScore = useMemo(
    () =>
      gapAnalysis.length
        ? getRepresentationScore(preparedData)
        : "Calculating...",
    [gapAnalysis, preparedData]
  );

  const closeDialog = () => {
    setGapAnalysis([]);
    dispatch(
      toggleDialog({ dialogName: "gapAnalysisDialogOpen", isOpen: false })
    );
  };

  return (
    <MarxanDialog
      loading={loading}
      open={dialogStates.gapAnalysisDialogOpen}
      onOk={() => closeDialog()}
      onCancel={() => closeDialog()}
      showSpinner={preprocessing}
      autoDetectWindowHeight={false}
      contentWidth={680}
      title="Gap Analysis"
      onClose={closeGapAnalysisDialog}
      showCancelButton={false}
    >
      <Box className="analysisReport">
        <Typography variant="body1">
          Gap Analysis for {metadata.pu_country} using the{" "}
          {marxanServer.wdpa_version} version of the WDPA.
        </Typography>
        <Box
          className="analysisReportInner"
          sx={{
            display: gapAnalysis.length ? "block" : "none",
          }}
        >
          <Box
            className="analysisChartsDiv"
            sx={{ display: showChart ? "none" : "block" }}
          >
            {charts}
          </Box>
          {showChart && (
            <ComposedChart
              width={550}
              height={350}
              data={preparedData}
              margin={{ bottom: 20, top: 20 }}
              style={{ margin: "auto" }}
            >
              <CartesianGrid strokeDasharray="1" stroke="#f4f4f4" />
              <XAxis
                dataKey="_alias"
                height={100}
                angle={-90}
                textAnchor="end"
                dx={-5}
              />
              <YAxis tick={{ fontSize: 11 }}>
                <Label
                  value="Percent Protected"
                  angle={-90}
                  position="insideBottomLeft"
                  style={{ fontSize: "11px", color: "#222222" }}
                  offset={30}
                />
              </YAxis>
              <Tooltip content={<CustomTooltip reportUnits={reportUnits} />} />
              <Bar dataKey="current_protected_percent" fill="#8884d8">
                {preparedData.map((entry) => (
                  <Cell fill={entry.color} key={entry.color} />
                ))}
              </Bar>
              <ReferenceLine
                y={preparedData[0]?.target_value || 0}
                stroke="#7C7C7C"
                strokeDasharray="3 3"
                style={{ display: preparedData.length ? "inline" : "none" }}
              />
            </ComposedChart>
          )}
          <Box className="gapAnalysisBtmPanel" sx={{ marginTop: 2 }}>
            <Box className="gapAnalysisStatsPanel">
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell>Features meeting targets:</TableCell>
                    <TableCell align="right">
                      {targetsMetCount}/{charts.length}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Representation score:</TableCell>
                    <TableCell align="right">{representationScore}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
            <Switch
              checked={showChart}
              onChange={(e) => setShowChart(e.target.checked)}
              sx={{ float: "right", marginTop: 1 }}
            />
          </Box>
        </Box>
      </Box>
    </MarxanDialog>
  );
};

export default GapAnalysisDialog;
