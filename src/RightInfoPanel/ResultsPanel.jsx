import { useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  useGetFeatureRepresentationQuery,
  useListPrioritizrRunsQuery,
} from "@slices/prioritizrApiSlice";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import DownloadIcon from "@mui/icons-material/Download";
import Log from "./Log";
import MapLegend from "./MapLegend";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import PanelHeader from "../BPComponents/PanelHeader";
import Paper from "@mui/material/Paper";
import RunsTab from "./RunsTab";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { generatePdfReport } from "@utils/generatePdfReport";
import { getApiBaseUrl } from "@config/api";
import { setActiveResultsTab } from "@slices/uiSlice";
import useAppSnackbar from "@hooks/useAppSnackbar";
import { useGetAllFeaturesQuery } from "@slices/featureSlice";

const TAB_VALUES = ["legend", "runs", "log"];

const ResultsPanel = (props) => {
  const { map, project, projectFeatures, metadata } = props;
  const { showMessage } = useAppSnackbar();

  const dispatch = useDispatch();
  const { dialogStates, importLog, activeResultsTab, uploadedActivities } =
    useSelector((state) => state.ui);
  const projectId = useSelector((s) => s.project.activeProjectId);
  const selectedRunIds = useSelector((s) => s.prioritizr.selectedRunIds);

  const { data: runsResp } = useListPrioritizrRunsQuery(projectId, {
    skip: !projectId,
  });
  const runs = runsResp?.data ?? [];

  // Feature name lookup (project features may not carry `name`)
  const { data: allFeaturesResp } = useGetAllFeaturesQuery();
  const allFeatures = allFeaturesResp?.data ?? [];

  // Per-feature achieved % from the selected Prioritizr runs (mirrors
  // FeaturesList.jsx — same stable sort so the RTK Query cache hits).
  const sortedRunIds = useMemo(
    () => [...selectedRunIds].sort((a, b) => a - b),
    [selectedRunIds],
  );
  const { data: reprResp } = useGetFeatureRepresentationQuery(sortedRunIds, {
    skip: sortedRunIds.length === 0,
  });
  const reprByFeatureUniqueId = useMemo(() => {
    if (sortedRunIds.length === 0 || !reprResp?.data) return {};
    return Object.fromEntries(
      reprResp.data.map((r) => {
        const pct = r.represented_percent;
        const perRun =
          Array.isArray(r.per_run) && r.per_run.length > 0
            ? r.per_run.map((p) => p.represented_percent)
            : [pct];
        return [r.feature_unique_id, { achieved: pct, perRun }];
      }),
    );
  }, [reprResp, sortedRunIds]);

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // PDF report download
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleDownloadPdf = useCallback(async () => {
    if (selectedRunIds.length === 0) {
      showMessage(
        "Please select at least one run to include in the report.",
        "error",
      );
      return;
    }
    setPdfLoading(true);

    try {
      // Capture map canvas (requires preserveDrawingBuffer: true on the map)
      let mapImageDataUrl = null;
      if (map?.current) {
        map.current.triggerRepaint();
        await new Promise((resolve) => map.current.once("render", resolve));
        mapImageDataUrl = map.current.getCanvas().toDataURL("image/png");
      }

      // Gather the selected run objects (for display names in the PDF)
      const selectedRuns = runs.filter((r) => selectedRunIds.includes(r.id));

      // Enrich features with alias (from getAllFeatures — `name` is the
      // auto-generated table name, `alias` is the human label) and the
      // achieved / target-met data from the selected runs. Target met =
      // number of selected runs whose represented_percent >= target_value.
      const featureAliasById = new Map(
        allFeatures.map((f) => [f.id ?? f.feature_unique_id, f.alias]),
      );
      const prettify = (s) => (s ? String(s).replace(/_/g, " ") : s);
      const enrichedFeatures = (projectFeatures ?? []).map((f) => {
        const uid = f.feature_unique_id ?? f.id;
        const repr = reprByFeatureUniqueId[uid] ?? null;
        const perRun = repr?.perRun ?? null;
        const target = Number(f.target_value ?? 0);
        const metCount =
          perRun != null ? perRun.filter((p) => p >= target).length : 0;
        const alias = f.alias ?? featureAliasById.get(uid) ?? null;
        return {
          ...f,
          alias: prettify(alias),
          achieved: repr?.achieved ?? null,
          metCount,
          runCount: perRun?.length ?? 0,
        };
      });

      await generatePdfReport({
        project,
        metadata,
        features: enrichedFeatures,
        activities: uploadedActivities ?? [],
        selectedRuns,
        mapImageDataUrl,
      });
    } finally {
      setPdfLoading(false);
    }
  }, [
    map,
    project,
    metadata,
    projectFeatures,
    allFeatures,
    reprByFeatureUniqueId,
    uploadedActivities,
    runs,
    selectedRunIds,
  ]);

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // GIS data download (shapefile or geopackage, zipped with sidecar CSVs)
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const [gisLoading, setGisLoading] = useState(false);
  const [gisAnchor, setGisAnchor] = useState(null);
  const authToken = useSelector((s) => s.auth?.token);

  const handleDownloadGis = useCallback(
    async (fmt) => {
      setGisAnchor(null);
      if (selectedRunIds.length === 0) {
        showMessage(
          "Please select at least one run to include in the export.",
          "error",
        );
        return;
      }
      if (!projectId) return;

      setGisLoading(true);
      try {
        const url =
          `${getApiBaseUrl()}prioritizr?action=export-runs` +
          `&project-id=${projectId}` +
          `&run-ids=${selectedRunIds.join(",")}` +
          `&format=${fmt}`;

        const headers = {};
        if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

        const resp = await fetch(url, {
          method: "GET",
          credentials: "include",
          headers,
        });
        if (!resp.ok) {
          // Server sends JSON on error
          let msg = `Download failed (${resp.status})`;
          try {
            const j = await resp.json();
            if (j?.error) msg = j.error;
          } catch {
            /* not JSON — keep generic message */
          }
          throw new Error(msg);
        }
        const blob = await resp.blob();

        // Prefer the filename the server sent in Content-Disposition;
        // fall back to a sensible default if the header is missing.
        const cd = resp.headers.get("Content-Disposition") || "";
        const match = cd.match(/filename="?([^"]+)"?/);
        const filename = match?.[1] || `project_${projectId}_runs_${fmt}.zip`;

        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(blobUrl);
      } catch (err) {
        showMessage(err.message || "Download failed", "error");
      } finally {
        setGisLoading(false);
      }
    },
    [projectId, selectedRunIds, authToken, showMessage],
  );
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const currentTabIndex = Math.max(0, TAB_VALUES.indexOf(activeResultsTab));
  const handleTabChange = (_e, idx) =>
    dispatch(setActiveResultsTab(TAB_VALUES[idx] ?? "legend"));

  const conditionalEndIcon = (loading) => {
    return loading ? (
      <CircularProgress size={18} sx={{ color: "white" }} />
    ) : (
      <DownloadIcon fontSize="small" />
    );
  };

  if (!dialogStates.resultsPanelOpen) return null;

  return (
    <div
      className="resultsPanel"
      style={{
        position: "absolute",
        right: "60px",
        top: "80px",
        width: "400px",
        maxHeight: "calc(100vh - 120px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Paper
        elevation={2}
        sx={{
          display: "flex",
          flexDirection: "column",
          maxHeight: "100%",
          overflow: "hidden",
        }}
      >
        <PanelHeader
          actions={
            <Box sx={{ display: "flex", gap: 0.5 }}>
              <Tooltip title="Download PDF report">
                <span>
                  <Button
                    size="small"
                    onClick={handleDownloadPdf}
                    disabled={pdfLoading}
                    sx={{
                      color: "white",
                      "&:hover": {
                        backgroundColor: "rgba(255,255,255,0.15)",
                      },
                    }}
                    endIcon={conditionalEndIcon(pdfLoading)}
                  >
                    PDF
                  </Button>
                </span>
              </Tooltip>
              <Tooltip title="Download GIS data (shapefile or geopackage) for the selected runs">
                <span>
                  <Button
                    size="small"
                    onClick={(e) => setGisAnchor(e.currentTarget)}
                    disabled={gisLoading}
                    sx={{
                      color: "white",
                      "&:hover": {
                        backgroundColor: "rgba(255,255,255,0.15)",
                      },
                    }}
                    endIcon={conditionalEndIcon(gisLoading)}
                  >
                    GIS
                  </Button>
                </span>
              </Tooltip>
              <Menu
                anchorEl={gisAnchor}
                open={Boolean(gisAnchor)}
                onClose={() => setGisAnchor(null)}
              >
                <MenuItem onClick={() => handleDownloadGis("shp")}>
                  Shapefile (.zip)
                </MenuItem>
                <MenuItem onClick={() => handleDownloadGis("gpkg")}>
                  GeoPackage (.gpkg in .zip)
                </MenuItem>
              </Menu>
            </Box>
          }
        >
          Results
        </PanelHeader>

        <Tabs value={currentTabIndex} onChange={handleTabChange} centered>
          <Tab label="Legend" />
          <Tab label="Runs" />
          <Tab label="Log" />
        </Tabs>

        <div style={{ overflow: "auto", flex: 1 }}>
          {currentTabIndex === 0 && (
            <MapLegend
              changeOpacity={props.changeOpacity}
              visibleLayers={props.visibleLayers}
              costsLoading={props.costsLoading}
              brew={props.brew}
            />
          )}

          {currentTabIndex === 1 && <RunsTab />}

          {currentTabIndex === 2 && <Log messages={importLog} />}
        </div>
      </Paper>
    </div>
  );
};

export default ResultsPanel;
