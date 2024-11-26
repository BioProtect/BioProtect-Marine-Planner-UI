import FileUpload from "../Uploads/FileUpload";
import MarxanDialog from "../MarxanDialog";
/*
 * Copyright (c) 2020 Andrew Cottam.
 *
 * This file is part of marxanweb/marxan-client
 * (see https://github.com/marxanweb/marxan-client).
 *
 * License: European Union Public Licence V. 1.2, see https://opensource.org/licenses/EUPL-1.2
 */
import React from "react";
let INITIAL_STATE = { costs_filename: "", costname: "" };

class ImportCostsDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = INITIAL_STATE;
  }
  resetState() {
    this.setState({ ...INITIAL_STATE });
  }
  onOk() {
    //add the cost to the application state
    this.props.addCost(this.state.costname);
    this.resetState();
    this.props.setImportCostsDialogOpen(false)}
  }
  setCostsFilename(filename) {
    this.setState({
      costs_filename: filename,
      costname: filename.substring(0, filename.length - 5),
    });
  }
  deleteCostFileThenClose() {
    this.props.deleteCostFileThenClose(this.state.costname).then((_) => {
      this.resetState();
      this.props.setImportCostsDialogOpen(false)
    });
  }
  render() {
    return (
      <MarxanDialog
        {...this.props}
        contentWidth={390}
        offsetY={80}
        okDisabled={this.props.loading}
        title="Import Cost surface"
        showCancelButton={true}
        onOk={this.onOk.bind(this)}
        onCancel={this.deleteCostFileThenClose.bind(this)}
        onClose={this.deleteCostFileThenClose.bind(this)}
        helpLink={"user.html#importing-a-cost-surface"}
      >
        {
          <React.Fragment key="k8">
            <FileUpload
              {...this.props}
              fileMatch={".cost"}
              mandatory={true}
              filename={this.state.costs_filename}
              setFilename={this.setCostsFilename.bind(this)}
              label="Costs surface filename"
              style={{ paddingTop: "15px" }}
            />
          </React.Fragment>
        }
      </MarxanDialog>
    );
  }
}

export default ImportCostsDialog;
