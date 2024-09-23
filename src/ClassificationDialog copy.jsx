import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  COLORCODES,
  NUMCLASSES,
  RENDERERS,
  TOPCLASSES,
} from "./classificationConstants";

import ColorSelector from "./ColorSelector";
import MarxanDialog from "./MarxanDialog";
/*
 * Copyright (c) 2020 Andrew Cottam.
 *
 * This file is part of marxanweb/marxan-client
 * (see https://github.com/marxanweb/marxan-client).
 *
 * License: European Union Public Licence V. 1.2, see https://opensource.org/licenses/EUPL-1.2
 */
import React from "react";
import RendererSelector from "./RendererSelector";

class ClassificationDialog extends React.Component {
  render() {
    let breaks = this.props.dataBreaks.map((item, index) => {
      //dont include the bottom line as we will use the y axis
      return <ReferenceLine x={item} key={index} stroke="#00BCD4" />;
    });
    return (
      <MarxanDialog
        {...this.props}
        contentWidth={390}
        rightX={0}
        offsetY={80}
        showCancelButton={false}
        helpLink={"user.html#changing-how-the-results-are-displayed"}
        title="Classification"
      >
        {
          <div style={{ height: "275px" }} key="k6">
            <BarChart width={250} height={150} data={this.props.summaryStats}>
              <CartesianGrid strokeDasharray="1" stroke="#f4f4f4" />
              <XAxis dataKey="number" tick={{ fontSize: 11 }} type={"number"}>
                <Label
                  value="Sum solutions"
                  offset={0}
                  position="insideBottom"
                  style={{ fontSize: "11px", color: "#222222" }}
                />
              </XAxis>
              <YAxis tick={{ fontSize: 11 }}>
                <Label
                  value="Count"
                  angle={-90}
                  position="insideLeft"
                  style={{ fontSize: "11px", color: "#222222" }}
                />
              </YAxis>
              <Tooltip />
              <Bar dataKey="count" fill="#E14081" />
              {breaks}
            </BarChart>
            <div className={"renderers"}>
              <ColorSelector
                values={COLORCODES}
                changeValue={this.props.changeColorCode}
                property={this.props.renderer.COLORCODE}
                floatingLabelText={"Colour scheme"}
                brew={this.props.brew}
              />
              <RendererSelector
                values={RENDERERS}
                changeValue={this.props.changeRenderer}
                property={this.props.renderer.CLASSIFICATION}
                floatingLabelText={"Classification"}
              />
              <RendererSelector
                values={NUMCLASSES}
                changeValue={this.props.changeNumClasses}
                property={this.props.renderer.NUMCLASSES}
                floatingLabelText={"Number of classes"}
              />
              <RendererSelector
                values={TOPCLASSES}
                changeValue={this.props.changeShowTopClasses}
                property={this.props.renderer.TOPCLASSES}
                floatingLabelText={"Show top n classes"}
              />
            </div>
          </div>
        }
      </MarxanDialog>
    );
  }
}

export default ClassificationDialog;
