import React, { useState } from "react";

import BioprotectTable from "./BPComponents/BioprotectTable";
import MarxanDialog from "./MarxanDialog";
import { generateTableCols } from "./Helpers";

const AtlasLayersDialog = (props) => {
  console.log("props.selectedLayers ", props.selectedLayers);
  const tableColumns = generateTableCols([{ id: "title", label: "title" }]);
  const updateSelection = (event, rowInfo) =>
    props.updateSelectedLayers(rowInfo);

  if (props.atlasLayers.length > 0) {
    return (
      <MarxanDialog
        open={props.open}
        onOk={props.onOk}
        onCancel={props.onCancel}
        loading={props.loading}
        title="Atlas Layers Selection"
        showCancelButton={true}
        cancelLabel="Clear all Layers"
      >
        <BioprotectTable
          title="Atlas Layers"
          data={props.atlasLayers}
          tableColumns={tableColumns}
          selected={props.selectedLayers} // has to be an array of indices
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
