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

const FeaturesDialog = ({
  onOk,
  metadata,
  userRole,
  openFeaturesDialog,
  initialiseDigitising,
  previewFeature,
  refreshFeatures,
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
    initialiseDigitising();
  };

  // const openImportGBIFDialog = () => {
  //   setImportGBIFDialogOpen(true);
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

  const removeFeature = (feature) => {
    const updatedFeatureIds = featureState.selectedFeatureIds.filter(
      (id) => id !== feature.id
    );
    dispatch(setSelectedFeatureIds(updatedFeatureIds));
  };

  //adds a feature to the selectedFeatureIds array
  const addFeature = (feature) =>
    dispatch(setSelectedFeatureIds((prevState) =>
      prevState.includes(feature.id) ? prevState : [...prevState, feature.id]
    ));

  const addOrRemoveFeature = (feature) => {
    console.log(" ------------------------------ addOrRemoveFeature ");
    console.log("feature ", feature);
    console.log("featureState.selectedFeatureIds ", featureState.selectedFeatureIds);

    return [...featureState.selectedFeatureIds].includes(feature.id)
      ? removeFeature(feature)
      : addFeature(feature);
  };

  const clickRow = (event, rowInfo) => {
    console.log("--------------------------- clickRow ");
    console.log("event, rowInfo ", event, rowInfo);
    console.log("featureState.addingRemovingFeatures ", featureState.addingRemovingFeatures);

    if (featureState.addingRemovingFeatures) {
      // Allow users to select multiple features using the shift key
      if (event.shiftKey) {
        const selectedIds = getFeaturesBetweenRows(previousRow, rowInfo);
        update(selectedIds);
      } else {
        addOrRemoveFeature(rowInfo.original, event.shiftKey, previousRow);
      }
      setPreviousRow(rowInfo);
    } else {
      console.log("--------------------------- setSelectedFeature ");

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

  // Function to allow users to select multiple features using the shift key
  const getFeaturesBetweenRows = (previousRow, thisRow) => {
    const idx1 =
      previousRow.index < thisRow.index ? previousRow.index + 1 : thisRow.index;
    const idx2 =
      previousRow.index < thisRow.index ? thisRow.index + 1 : previousRow.index;

    if (filteredRows.length < featureState.allFeatures.length) {
      return toggleSelectionState(
        featureState.selectedFeatureIds,
        filteredRows,
        idx1,
        idx2
      );
    } else {
      return toggleSelectionState(
        featureState.selectedFeatureIds,
        featureState.allFeatures,
        idx1,
        idx2
      );
    }
  };

  const selectAllFeatures = () => {
    if (filteredRows.length < featureState.allFeatures.length) {
      const selectedIds = filteredRows.map((feature) => feature.id);
      dispatch(setSelectedFeatureIds(selectedIds));
    } else {
      dispatch(setSelectedFeatureIds(featureState.allFeatures.map((feature) => feature.id)));
    }
  };

  const handleClickOk = () => {
    if (featureState.addingRemovingFeatures) {
      onOk();
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
      loading={uiState.loading}
      onOk={handleClickOk}
      showCancelButton={featureState.addingRemovingFeatures}
      autoDetectWindowHeight={false}
      title="Features"
      // showSearchBox={true}
      // searchTextChanged={searchTextChanged}
      actions={
        <FeaturesToolbar
          metadata={metadata}
          userRole={userRole}
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
          preview={() => previewFeature(featureMetadata)}
        />
      </div>
    </MarxanDialog>
  );
};

export default FeaturesDialog;
