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
import React from "react";
import RendererSelector from "./RendererSelector";

const ClassificationDialog = (props) => {
  // Generate reference lines based on dataBreaks
  const breaks = props.dataBreaks.map((item, index) => (
    // Don't include the bottom line as we will use the Y-axis
    <ReferenceLine x={item} key={index} stroke="#00BCD4" />
  ));

  return (
    <MarxanDialog
      open={props.open}
      onOk={props.onOk}
      onCancel={props.onCancel}
      loading={props.loading}
      showCancelButton={false}
      helpLink={"user.html#changing-how-the-results-are-displayed"}
      title="Classification"
    >
      <div style={{ height: "275px" }} key="k6">
        <BarChart width={250} height={150} data={props.summaryStats}>
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

        <div className="renderers">
          <ColorSelector
            values={COLORCODES}
            changeValue={props.changeColorCode}
            property={props.renderer.COLORCODE}
            floatingLabelText="Colour scheme"
            brew={props.brew}
          />
          <RendererSelector
            values={RENDERERS}
            changeValue={props.changeRenderer}
            property={props.renderer.CLASSIFICATION}
            floatingLabelText="Classification"
          />
          <RendererSelector
            values={NUMCLASSES}
            changeValue={props.changeNumClasses}
            property={props.renderer.NUMCLASSES}
            floatingLabelText="Number of classes"
          />
          <RendererSelector
            values={TOPCLASSES}
            changeValue={props.changeShowTopClasses}
            property={props.renderer.TOPCLASSES}
            floatingLabelText="Show top n classes"
          />
        </div>
      </div>
    </MarxanDialog>
  );
};

export default ClassificationDialog;
