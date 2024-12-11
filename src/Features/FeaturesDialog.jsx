import React, { useCallback, useEffect, useState } from "react";
import {
  setActiveResultsTab,
  setActiveTab,
  setSnackbarMessage,
  setSnackbarOpen,
  toggleDialog,
  toggleFeatureDialog,
  togglePlanningGridDialog,
  toggleProjectDialog,
} from "../slices/uiSlice";
import { useDispatch, useSelector } from "react-redux";

import BioprotectTable from "../BPComponents/BioprotectTable";
import FeaturesToolbar from "./FeaturesToolbar";
import MarxanDialog from "../MarxanDialog";
import { generateTableCols } from "../Helpers";

const FeaturesDialog = (props) => {
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui);
  const dialogStates = useSelector((state) => state.ui.dialogStates);
  const projectDialogStates = useSelector(
    (state) => state.ui.projectDialogStates
  );
  const featureDialogStates = useSelector(
    (state) => state.ui.featureDialogStates
  );
  const planningGridDialogStates = useSelector(
    (state) => state.ui.planningGridDialogStates
  );
  const [selectedFeature, setSelectedFeature] = useState(undefined);
  const [previousRow, setPreviousRow] = useState(undefined);
  const [searchText, setSearchText] = useState("");
  const [filteredRows, setFilteredRows] = useState([]);
  const [newFeatureAnchor, setNewFeatureAnchor] = useState(null);
  const [importFeatureAnchor, setImportFeatureAnchor] = useState(null);

  const _delete = () => {
    props.deleteFeature(selectedFeature);
    setSelectedFeature(undefined);
  };

  const showNewFeaturePopover = (event) => {
    setNewFeatureAnchor(event.currentTarget);
    dispatch(
      toggleFeatureDialog({
        dialogName: "newFeaturePopoverOpen",
        isOpen: true,
      })
    );
  };

  const showImportFeaturePopover = (event) => {
    setImportFeatureAnchor(event.currentTarget);
    dispatch(
      toggleFeatureDialog({ dialogName: "featuresDialogOpen", isOpen: true })
    );
  };

  const _openImportFeaturesDialog = () => {
    dispatch(
      toggleFeatureDialog({
        dialogName: "newFeaturePopoverOpen",
        isOpen: false,
      })
    );
    dispatch(
      toggleFeatureDialog({
        dialogName: "importFeaturePopoverOpen",
        isOpen: false,
      })
    );
    dispatch(
      toggleFeatureDialog({
        dialogName: "featuresDialogOpen",
        isOpen: false,
      })
    );
    dispatch(
      toggleFeatureDialog({
        dialogName: "importFeaturesDialogOpen",
        isOpen: true,
      })
    );
  };

  const _openImportFromWebDialog = () => {
    dispatch(
      toggleFeatureDialog({
        dialogName: "newFeaturePopoverOpen",
        isOpen: false,
      })
    );
    dispatch(
      toggleFeatureDialog({
        dialogName: "importFeaturePopoverOpen",
        isOpen: false,
      })
    );
    dispatch(
      toggleDialog({
        dialogName: "importFromWebDialogOpen",
        isOpen: true,
      })
    );
    dispatch(
      toggleFeatureDialog({
        dialogName: "featuresDialogOpen",
        isOpen: false,
      })
    );
  };

  const _newByDigitising = () => {
    onOk();
    props.initialiseDigitising();
  };

  const openImportGBIFDialog = () => {
    props.setImportGBIFDialogOpen(true);
    dispatch(
      toggleFeatureDialog({
        dialogName: "importFeaturePopoverOpen",
        isOpen: false,
      })
    );
    dispatch(
      toggleFeatureDialog({
        dialogName: "newFeaturePopoverOpen",
        isOpen: false,
      })
    );
    dispatch(
      toggleFeatureDialog({
        dialogName: "featuresDialogOpen",
        isOpen: false,
      })
    );
  };

  const clickRow = (event, rowInfo) => {
    console.log("rowInfo ", rowInfo);
    console.log("event ", event);
    if (props.addingRemovingFeatures) {
      if (event.shiftKey) {
        const selectedIds = getFeaturesBetweenRows(previousRow, rowInfo);
        props.update(selectedIds);
      } else {
        props.clickFeature(rowInfo.original, event.shiftKey, previousRow);
      }
      setPreviousRow(rowInfo);
    } else {
      setSelectedFeature(rowInfo.original);
    }
  };

  const toggleSelectionState = (selectedIds, features, first, last) => {
    const spannedFeatures = features.slice(first, last);
    spannedFeatures.forEach((feature) => {
      if (selectedIds.includes(feature.id)) {
        selectedIds.splice(selectedIds.indexOf(feature.id), 1);
      } else {
        selectedIds.push(feature.id);
      }
    });
    return selectedIds;
  };

  const getFeaturesBetweenRows = (previousRow, thisRow) => {
    const idx1 =
      previousRow.index < thisRow.index ? previousRow.index + 1 : thisRow.index;
    const idx2 =
      previousRow.index < thisRow.index ? thisRow.index + 1 : previousRow.index;

    if (filteredRows.length < props.allFeatures.length) {
      return toggleSelectionState(
        props.selectedFeatureIds,
        filteredRows,
        idx1,
        idx2
      );
    } else {
      return toggleSelectionState(
        props.selectedFeatureIds,
        props.allFeatures,
        idx1,
        idx2
      );
    }
  };

  const selectAllFeatures = () => {
    if (filteredRows.length < props.allFeatures.length) {
      const selectedIds = filteredRows.map((feature) => feature.id);
      props.setSelectedFeatureIds(selectedIds);
    } else {
      props.selectAllFeatures();
    }
  };

  const onOk = () => {
    if (props.addingRemovingFeatures) {
      props.onOk();
    } else {
      unselectFeature();
    }
  };

  const unselectFeature = () => {
    setSelectedFeature(undefined);
    dispatch(
      toggleFeatureDialog({
        dialogName: "importFeaturePopoverOpen",
        isOpen: false,
      })
    );
    dispatch(
      toggleFeatureDialog({
        dialogName: "newFeaturePopoverOpen",
        isOpen: false,
      })
    );
    dispatch(
      toggleFeatureDialog({
        dialogName: "featuresDialogOpen",
        isOpen: false,
      })
    );
  };

  const searchTextChanged = (value) => {
    setSearchText(value);
  };

  const dataFiltered = (filteredRows) => {
    setFilteredRows(filteredRows);
  };

  if (!props.allFeatures) return null;

  const columns = generateTableCols([
    { id: "alias", label: "alias" },
    { id: "description", label: "description" },
    { id: "source", label: "source" },
    { id: "creation_date", label: "Date" },
    { id: "created_by", label: "By" },
  ]);

  return (
    <MarxanDialog
      open={featureDialogStates.featuresDialogOpen}
      loading={props.loading}
      autoDetectWindowHeight={false}
      title="Features"
      onOk={onOk}
      showCancelButton={props.addingRemovingFeatures}
      showSearchBox={true}
      searchTextChanged={searchTextChanged}
      actions={
        <FeaturesToolbar
          metadata={props.metadata}
          userRole={props.userRole}
          addingRemovingFeatures={props.addingRemovingFeatures}
          loading={props.loading}
          selectedFeature={selectedFeature}
          selectAllFeatures={() => selectAllFeatures()}
          _openImportFeaturesDialog={() => _openImportFeaturesDialog()}
          _openImportFromWebDialog={() => _openImportFromWebDialog()}
          _delete={() => _delete()}
          _newByDigitising={_newByDigitising}
          setSelectedFeatureIds={props.setSelectedFeatureIds}
        />
      }
    >
      <div id="react-features-dialog-table">
        <BioprotectTable
          data={props.allFeatures}
          tableColumns={columns}
          searchColumns={["alias", "description", "source", "created_by"]}
          dataFiltered={dataFiltered}
          addingRemovingFeatures={props.addingRemovingFeatures}
          selected={props.selectedFeatureIds}
          selectedFeatureIds={props.selectedFeatureIds}
          selectedFeature={selectedFeature}
          clickRow={clickRow}
          preview={() => props.previewFeature(feature_metadata)}
        />
      </div>
    </MarxanDialog>
  );
};

export default FeaturesDialog;
