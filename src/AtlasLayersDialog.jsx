import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import BioprotectTable from "./BPComponents/BioprotectTable";
import MarxanDialog from "./MarxanDialog";
import { generateTableCols } from "./Helpers";
import { toggleDialog } from "@slices/uiSlice";

const AtlasLayersDialog = ({
  map,
  atlasLayers,
}) => {
  const [selectedLayers, setSelectedLayers] = useState([]);

  const dispatch = useDispatch();
  const uiState = useSelector((state) => state.ui);
  const dialogStates = useSelector((state) => state.ui.dialogStates);
  const tableColumns = generateTableCols([{ id: "title", label: "title" }]);

  const clearSelectedLayers = () => {
    const layers = [...selectedLayers];
    layers.forEach((layer) => updateSelectedLayers(layer));
    dispatch(
      toggleDialog({ dialogName: "atlasLayersDialogOpen", isOpen: false })
    );
  };

  const updateSelectedLayers = (event, rowInfo) => {
    // Determine the new visibility
    const currentVisibility = map.current.getLayoutProperty(
      rowInfo.layer,
      "visibility"
    );
    const newVisibility = currentVisibility === "visible" ? "none" : "visible";
    // Update the layer's visibility
    map.current.setLayoutProperty(rowInfo.layer, "visibility", newVisibility);

    // Update the selectedLayers state

    setSelectedLayers((prevState) => {
      const isLayerSelected = prevState.includes(rowInfo);

      return isLayerSelected
        ? prevState.filter((item) => item !== rowInfo)
        : [...prevState, rowInfo];
    });
  };

  const closeDialog = () =>
    dispatch(
      toggleDialog({ dialogName: "atlasLayersDialogOpen", isOpen: false })
    );

  if (atlasLayers.length > 0) {
    return (
      <MarxanDialog
        open={dialogStates.atlasLayersDialogOpen}
        onOk={() => closeDialog()}
        onCancel={() => clearSelectedLayers()}
        loading={uiState.loading}
        title="Atlas Layers Selection"
        showCancelButton={true}
        cancelLabel="Clear all Layers"
      >
        <BioprotectTable
          title="Atlas Layers"
          data={atlasLayers}
          tableColumns={tableColumns}
          selected={selectedLayers} // has to be an array of indices
          ableToSelectAll={true}
          showSearchBox={true}
          searchColumns={["title"]}
          updateSelection={(event, rowInfo) => updateSelectedLayers(event, rowInfo)}
          clickRow={(event, rowInfo) => updateSelectedLayers(event, rowInfo)}
        />
      </MarxanDialog>
    );
  } else {
    return null;
  }
};

export default AtlasLayersDialog;
