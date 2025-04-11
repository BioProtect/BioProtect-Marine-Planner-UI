import React, { useCallback, useEffect, useState } from "react";
import { setSelectedFeature, setSelectedFeatureIds, toggleFeatureD } from "../slices/featureSlice";
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
  const [previousRow, setPreviousRow] = useState(undefined);
  const [searchText, setSearchText] = useState("");
  const [filteredRows, setFilteredRows] = useState([]);
  const [newFeatureAnchor, setNewFeatureAnchor] = useState(null);
  const [importFeatureAnchor, setImportFeatureAnchor] = useState(null);


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

  const _newByDigitising = () => {
    onOk();
    props.initialiseDigitising();
  };

  // const openImportGBIFDialog = () => {
  //   props.setImportGBIFDialogOpen(true);
  //   dispatch(
  //     toggleFeatureD({
  //       dialogName: "importFeaturePopoverOpen",
  //       isOpen: false,
  //     })
  //   );
  //   dispatch(
  //     toggleFeatureD({
  //       dialogName: "newFeaturePopoverOpen",
  //       isOpen: false,
  //     })
  //   );
  //   dispatch(
  //     toggleFeatureD({
  //       dialogName: "featuresDialogOpen",
  //       isOpen: false,
  //     })
  //   );
  // };

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
      dispatch(setSelectedFeature(rowInfo.original));
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
      dispatch(setSelectedFeatureIds(uiState.allFeatures.map((feature) => feature.id)));
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
    dispatch(setSelectedFeature(undefined));
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


  const columns = generateTableCols([
    { id: "alias", label: "alias" },
    { id: "description", label: "description" },
    { id: "source", label: "source" },
    { id: "creation_date", label: "Date" },
    { id: "created_by", label: "By" },
  ]);

  return (
    <MarxanDialog
      open={featureState.dialogs.featuresDialogOpen}
      loading={props.loading}
      onOk={onOk}
      showCancelButton={uiState.addingRemovingFeatures}
      autoDetectWindowHeight={false}
      title="Features"
      // showSearchBox={true}
      // searchTextChanged={searchTextChanged}
      actions={
        <FeaturesToolbar
          metadata={props.metadata}
          userRole={props.userRole}
          loading={props.loading}
          selectAllFeatures={() => selectAllFeatures()}
          _newByDigitising={_newByDigitising}
        />
      }
    >
      <div id="react-features-dialog-table">
        <BioprotectTable
          title="Features"
          data={featureState.allFeatures}
          tableColumns={columns}
          searchColumns={["alias", "description", "source", "created_by"]}
          dataFiltered={dataFiltered}
          selected={featureState.selectedFeatureIds}
          selectedFeatureIds={featureState.selectedFeatureIds}
          selectedFeature={featureState.selectedFeature}
          clickRow={clickRow}
          preview={() => props.previewFeature(featureMetadata)}
        />
      </div>
    </MarxanDialog>
  );
};

export default FeaturesDialog;
