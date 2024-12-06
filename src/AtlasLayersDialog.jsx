import { useDispatch, useSelector } from "react-redux";

import BioprotectTable from "./BPComponents/BioprotectTable";
import MarxanDialog from "./MarxanDialog";
import React from "react";
import { generateTableCols } from "./Helpers";
import { toggleDialog } from "./slices/uiSlice";

const AtlasLayersDialog = ({
  onCancel,
  loading,
  atlasLayers,
  selectedLayers,
  updateSelectedLayers,
}) => {
  const dispatch = useDispatch();
  const dialogStates = useSelector((state) => state.ui.dialogStates);
  const tableColumns = generateTableCols([{ id: "title", label: "title" }]);
  const updateSelection = (event, rowInfo) => updateSelectedLayers(rowInfo);

  if (atlasLayers.length > 0) {
    return (
      <MarxanDialog
        open={dialogStates.atlasLayersDialogOpen}
        onOk={dispatch(
          toggleDialog({ dialogName: "atlasLayersDialogOpen", isOpen: false })
        )}
        onCancel={onCancel}
        loading={loading}
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
          updateSelection={updateSelection}
          clickRow={updateSelection}
        />
      </MarxanDialog>
    );
  } else {
    return null;
  }
};

export default AtlasLayersDialog;
