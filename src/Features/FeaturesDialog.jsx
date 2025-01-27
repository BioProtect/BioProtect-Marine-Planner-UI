import React, { useCallback, useEffect, useState } from "react";
import { selectAllFeatures, setSelectedFeatureIds, toggleFeatureD } from "../slices/featureSlice";
import { useDispatch, useSelector } from "react-redux";

import BioprotectTable from "../BPComponents/BioprotectTable";
import FeaturesToolbar from "./FeaturesToolbar";
import MarxanDialog from "../MarxanDialog";
import { generateTableCols } from "../Helpers";
import {
  toggleDialog,
} from "../slices/uiSlice";

const FeaturesDialog = (props) => {
  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui);
  const featureState = useSelector((state) => state.feature);
  const dialogStates = useSelector((state) => state.ui.dialogStates);
  const projectState = useSelector((state) => state.project);
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
      toggleFeatureD({
        dialogName: "newFeaturePopoverOpen",
        isOpen: true,
      })
    );
  };

  const showImportFeaturePopover = (event) => {
    setImportFeatureAnchor(event.currentTarget);
    dispatch(
      toggleFeatureD({ dialogName: "featuresDialogOpen", isOpen: true })
    );
  };

  const _openImportFeaturesDialog = () => {
    dispatch(
      toggleFeatureD({
        dialogName: "newFeaturePopoverOpen",
        isOpen: false,
      })
    );
    dispatch(
      toggleFeatureD({
        dialogName: "importFeaturePopoverOpen",
        isOpen: false,
      })
    );
    dispatch(
      toggleFeatureD({
        dialogName: "featuresDialogOpen",
        isOpen: false,
      })
    );
    dispatch(
      toggleFeatureD({
        dialogName: "importFeaturesDialogOpen",
        isOpen: true,
      })
    );
  };

  const _openImportFromWebDialog = () => {
    dispatch(
      toggleFeatureD({
        dialogName: "newFeaturePopoverOpen",
        isOpen: false,
      })
    );
    dispatch(
      toggleFeatureD({
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
      toggleFeatureD({
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
      toggleFeatureD({
        dialogName: "importFeaturePopoverOpen",
        isOpen: false,
      })
    );
    dispatch(
      toggleFeatureD({
        dialogName: "newFeaturePopoverOpen",
        isOpen: false,
      })
    );
    dispatch(
      toggleFeatureD({
        dialogName: "featuresDialogOpen",
        isOpen: false,
      })
    );
  };

  const clickRow = (event, rowInfo) => {
    if (uiState.addingRemovingFeatures) {
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

    if (filteredRows.length < uiState.allFeatures.length) {
      return toggleSelectionState(
        featureState.selectedFeatureIds,
        filteredRows,
        idx1,
        idx2
      );
    } else {
      return toggleSelectionState(
        featureState.selectedFeatureIds,
        uiState.allFeatures,
        idx1,
        idx2
      );
    }
  };

  const selectAllFeatures = () => {
    if (filteredRows.length < uiState.allFeatures.length) {
      const selectedIds = filteredRows.map((feature) => feature.id);
      dispatch(setSelectedFeatureIds(selectedIds));
    } else {
      props.selectAllFeatures();
    }
  };

  const onOk = () => {
    if (uiState.addingRemovingFeatures) {
      props.onOk();
    } else {
      unselectFeature();
    }
  };

  const unselectFeature = () => {
    setSelectedFeature(undefined);
    dispatch(
      toggleFeatureD({
        dialogName: "importFeaturePopoverOpen",
        isOpen: false,
      })
    );
    dispatch(
      toggleFeatureD({
        dialogName: "newFeaturePopoverOpen",
        isOpen: false,
      })
    );
    dispatch(
      toggleFeatureD({
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

  if (!uiState.allFeatures) {
    return null;
  }

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
      showCancelButton={uiState.addingRemovingFeatures}
      showSearchBox={true}
      searchTextChanged={searchTextChanged}
      actions={
        <FeaturesToolbar
          metadata={props.metadata}
          userRole={props.userRole}
          loading={props.loading}
          selectedFeature={selectedFeature}
          selectAllFeatures={() => selectAllFeatures()}
          _openImportFeaturesDialog={() => _openImportFeaturesDialog()}
          _openImportFromWebDialog={() => _openImportFromWebDialog()}
          _delete={() => _delete()}
          _newByDigitising={_newByDigitising}
        />
      }
    >
      <div id="react-features-dialog-table">
        <BioprotectTable
          data={uiState.allFeatures}
          tableColumns={columns}
          searchColumns={["alias", "description", "source", "created_by"]}
          dataFiltered={dataFiltered}
          selected={featureState.selectedFeatureIds}
          selectedFeatureIds={featureState.selectedFeatureIds}
          selectedFeature={selectedFeature}
          clickRow={clickRow}
          preview={() => props.previewFeature(featureMetadata)}
        />
      </div>
    </MarxanDialog>
  );
};

export default FeaturesDialog;
