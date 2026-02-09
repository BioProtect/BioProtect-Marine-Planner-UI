import {
  setAddingRemovingFeatures,
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
import { setSelectedFeatureId } from "../slices/featureSlice";
import useAppSnackbar from "@hooks/useAppSnackbar";
import { useGetAllFeaturesQuery } from "@slices/featureSlice";

const FeaturesDialog = ({
  onOk,
  metadata,
  userRole,
  initialiseDigitising,
  previewFeature,
}) => {
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui);
  const featureState = useSelector((state) => state.feature);
  const projState = useSelector((state) => state.project);

  const [previousRow, setPreviousRow] = useState(undefined);
  const [searchText, setSearchText] = useState("");
  const [filteredRows, setFilteredRows] = useState([]);
  const [newFeatureAnchor, setNewFeatureAnchor] = useState(null);
  const [importFeatureAnchor, setImportFeatureAnchor] = useState(null);
  const dialogIsOpen = featureState.dialogs.featuresDialogOpen;

  const { showMessage } = useAppSnackbar();
  const {
    data: allFeaturesResp,
    isFetching: isFetchingAllFeatures,
    isError,
    error,
  } = useGetAllFeaturesQuery(undefined, { skip: !dialogIsOpen });
  const allFeatures = allFeaturesResp?.data ?? allFeaturesResp ?? [];

  const selectedFeatureId = featureState.selectedFeatureId;

  const selectedFeature = useMemo(() => {
    if (selectedFeatureId == null) return null;
    return allFeatures.find((f) => f.id === selectedFeatureId) ?? null;
  }, [allFeatures, selectedFeatureId]);

  const _newByDigitising = () => {
    onOk();
    initialiseDigitising();
  };

  const addOrRemoveFeature = (feature) => {
    const ids = featureState.selectedFeatureIds || [];
    // if the feature is already included remove it, otherwise add it
    if (ids.includes(feature.id)) {
      dispatch(setSelectedFeatureIds(ids.filter((id) => id !== feature.id)));
    } else {
      dispatch(setSelectedFeatureIds([...ids, feature.id]));
    }
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
    const from =
      prevRow.index < thisRow.index ? prevRow.index + 1 : thisRow.index;
    const to =
      prevRow.index < thisRow.index ? thisRow.index + 1 : prevRow.index;

    const base =
      filteredRows.length < allFeatures.length ? filteredRows : allFeatures;

    return toggleSelectionState(
      featureState.selectedFeatureIds || [],
      base,
      from,
      to
    );
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
      dispatch(setSelectedFeatureId(row.id));
    }
  };

  const selectAllFeatures = () => {
    const ids =
      filteredRows.length < allFeatures.length
        ? filteredRows.map((f) => f.id)
        : allFeatures.map((f) => f.id);
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
    dispatch(setSelectedFeatureId(null));
    dispatch(
      toggleFeatureD({ dialogName: "importFeaturePopoverOpen", isOpen: false })
    );
    dispatch(
      toggleFeatureD({ dialogName: "newFeaturePopoverOpen", isOpen: false })
    );
    dispatch(
      toggleFeatureD({ dialogName: "featuresDialogOpen", isOpen: false })
    );
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

  const tableData = useMemo(
    () =>
      allFeatures.map((feature, index) => ({
        ...feature,
        index,
      })),
    [allFeatures]
  );

  const closeDialog = () => {
    dispatch(
      toggleFeatureD({ dialogName: "featuresDialogOpen", isOpen: false })
    );
    dispatch(setAddingRemovingFeatures(false));
  };

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
          selectAllFeatures={selectAllFeatures}
          _newByDigitising={_newByDigitising}
          selectedFeature={selectedFeature}
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
          selectedFeature={selectedFeature}
          clickRow={clickRow}
          preview={(row) => previewFeature?.(row)}
        />
      </div>
    </MarxanDialog>
  );
};

export default FeaturesDialog;
