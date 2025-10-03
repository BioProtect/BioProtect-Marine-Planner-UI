import {
  setAddingRemovingFeatures,
  setAllFeatures,
  setSelectedFeature,
  setSelectedFeatureIds,
  toggleFeatureD,
} from "@slices/featureSlice";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import BioprotectTable from "../BPComponents/BioprotectTable";
import { CONSTANTS } from "../bpVars";
import FeaturesToolbar from "./FeaturesToolbar";
import MarxanDialog from "../MarxanDialog";
import { generateTableCols } from "../Helpers";
import jsonp from "jsonp-promise";
import { setLoading } from "@slices/uiSlice";
import useAppSnackbar from "@hooks/useAppSnackbar";

const FeaturesDialog = ({ onOk, metadata, userRole, initialiseDigitising, previewFeature }) => {
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui);
  const featureState = useSelector((state) => state.feature);
  const projState = useSelector((state) => state.project);

  const [previousRow, setPreviousRow] = useState(undefined);
  const [searchText, setSearchText] = useState("");
  const [filteredRows, setFilteredRows] = useState([]);
  const [newFeatureAnchor, setNewFeatureAnchor] = useState(null);
  const [importFeatureAnchor, setImportFeatureAnchor] = useState(null);
  const { showMessage } = useAppSnackbar();



  // Lazy-load features the first time the dialog opens (or whenever it's opened with an empty cache)
  useEffect(() => {
    const dialogIsOpen = featureState.dialogs.featuresDialogOpen;
    const noFeatures = !featureState.allFeatures?.length;
    const base = projState?.bpServer?.endpoint;
    if (!dialogIsOpen || !noFeatures || !base) return;

    let cancelled = false;
    (async () => {
      try {
        dispatch(setLoading(true));
        const url = new URL('getAllSpeciesData', base).toString();
        const resp = await jsonp(url, { timeout: CONSTANTS.TIMEOUT }).promise;
        if (cancelled) return;
        // resp.data expected from your App.jsx usage
        dispatch(setAllFeatures(resp?.data || []));
      } catch (err) {
        if (!cancelled) {
          showMessage("Failed to load features:", err);
          console.error("Failed to load features:", err);
        }
      } finally {
        if (!cancelled) dispatch(setLoading(false));
      }
    })();
    return () => { cancelled = true; };
  }, [
    featureState.dialogs.featuresDialogOpen,
    featureState.allFeatures?.length,
    dispatch, projState?.bpServer?.endpoint
  ]);

  const _newByDigitising = () => {
    onOk();
    initialiseDigitising();
  };

  // const showNewFeaturePopover = (event) => {
  //   setNewFeatureAnchor(event.currentTarget);
  //   dispatch(
  //     toggleFeatureD({
  //       dialogName: "newFeaturePopoverOpen",
  //       isOpen: true,
  //     })
  //   );
  // };

  // const showImportFeaturePopover = (event) => {
  //   setImportFeatureAnchor(event.currentTarget);
  //   dispatch(
  //     toggleFeatureD({ dialogName: "featuresDialogOpen", isOpen: true })
  //   );
  // };

  const addOrRemoveFeature = (feature) => {
    const ids = featureState.selectedFeatureIds || [];
    // if the feature is already included remove it, otherwise add it 
    if (ids.includes(feature.id)) {
      dispatch(setSelectedFeatureIds(ids.filter((id) => id !== feature.id)));
    } else {
      dispatch(setSelectedFeatureIds([...ids, feature.id]));
    }
  };

  const toggleSelectionState = (selectedIds, features, first, last) => {
    const next = [...selectedIds];
    const spanned = features.slice(first, last);
    for (const feature of spanned) {
      const i = next.indexOf(feature.id);
      if (i >= 0) next.splice(i, 1);
      else next.push(feature.id);
    }
    return next;
  };

  // Function to allow users to select multiple features using the shift key
  const getFeaturesBetweenRows = (prevRow, thisRow) => {
    const from = prevRow.index < thisRow.index ? prevRow.index + 1 : thisRow.index;
    const to = prevRow.index < thisRow.index ? thisRow.index + 1 : prevRow.index;

    const base = filteredRows.length < featureState.allFeatures.length
      ? filteredRows
      : featureState.allFeatures;

    return toggleSelectionState(featureState.selectedFeatureIds || [], base, from, to);
  };

  const clickRow = (event, row) => {
    console.log("event, row ", event, row);
    if (!row || row.index === undefined) return;

    addOrRemoveFeature(row);

    if (featureState.addingRemovingFeatures) {
      if (event.shiftKey && previousRow) {
        const nextIds = getFeaturesBetweenRows(previousRow, row);
        dispatch(setSelectedFeatureIds(nextIds));
      }
      setPreviousRow(row);
    } else {
      // Also track which feature is "active" for detail view
      dispatch(setSelectedFeature(row));
    }
  };

  const selectAllFeatures = () => {
    const ids = filteredRows.length < featureState.allFeatures.length
      ? filteredRows.map((f) => f.id)
      : featureState.allFeatures.map((f) => f.id);
    dispatch(setSelectedFeatureIds(ids));
  };

  const clearAllFeatures = () => dispatch(setSelectedFeatureIds([]));

  const handleClickOk = () => {
    if (featureState.addingRemovingFeatures) {
      onOk();
    } else {
      unselectFeature();
    }
  };

  const unselectFeature = () => {
    dispatch(setSelectedFeature(undefined));
    dispatch(toggleFeatureD({ dialogName: "importFeaturePopoverOpen", isOpen: false }));
    dispatch(toggleFeatureD({ dialogName: "newFeaturePopoverOpen", isOpen: false }));
    dispatch(toggleFeatureD({ dialogName: "featuresDialogOpen", isOpen: false }));
  };

  const searchTextChanged = useCallback((value) => setSearchText(value), []);
  const dataFiltered = useCallback((rows) => setFilteredRows(rows), []);

  const columns = generateTableCols([
    { id: "alias", label: "alias" },
    { id: "description", label: "description" },
    { id: "source", label: "source" },
    { id: "creation_date", label: "Date" },
    { id: "created_by", label: "By" },
  ]);

  const tableData = useMemo(() => featureState.allFeatures.map((feature, index) => ({
    ...feature,
    index,
  })),
    [featureState.allFeatures]
  );

  const closeDialog = () => {
    dispatch(toggleFeatureD({ dialogName: "featuresDialogOpen", isOpen: false }));
    dispatch(setAddingRemovingFeatures(false));
  }

  return (
    <MarxanDialog
      open={featureState.dialogs.featuresDialogOpen}
      loading={uiState.loading}
      onOk={handleClickOk}
      onCancel={closeDialog}
      showCancelButton={featureState.addingRemovingFeatures}
      autoDetectWindowHeight={false}
      title="Features"
      // showSearchBox={true}
      // searchTextChanged={searchTextChanged}
      actions={
        <FeaturesToolbar
          metadata={metadata}
          userRole={userRole}
          selectAllFeatures={selectAllFeatures}
          _newByDigitising={_newByDigitising}
          clearAll={clearAllFeatures}
        />
      }
    >
      <div id="react-features-dialog-table">
        <BioprotectTable
          title="Features"
          data={tableData}
          tableColumns={columns}
          searchColumns={["alias", "description", "source", "created_by"]}
          dataFiltered={dataFiltered}
          selected={featureState.selectedFeatureIds}
          selectedFeatureIds={featureState.selectedFeatureIds}
          selectedFeature={featureState.selectedFeature}
          clickRow={clickRow}
          preview={(row) => previewFeature?.(row)}
        />
      </div>
    </MarxanDialog >
  );
};

export default FeaturesDialog;
