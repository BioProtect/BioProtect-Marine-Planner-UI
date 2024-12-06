import BioprotectTable from "./BPComponents/BioprotectTable";
import MarxanDialog from "./MarxanDialog";
import React from "react";
import { generateTableCols } from "./Helpers";

const AtlasLayersDialog = ({
  open,
  onOk,
  onCancel,
  loading,
  atlasLayers,
  selectedLayers,
  updateSelectedLayers,
}) => {
  const tableColumns = generateTableCols([{ id: "title", label: "title" }]);
  const updateSelection = (event, rowInfo) => updateSelectedLayers(rowInfo);

  if (atlasLayers.length > 0) {
    return (
      <MarxanDialog
        open={open}
        onOk={onOk}
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
