import React from "react";
import { getArea } from "./Helpers";
import { selectCurrentUser } from "@slices/authSlice";
import { useSelector } from "react-redux";

const CustomTooltip = ({ active, payload }) => {
  const userData = useSelector(selectCurrentUser);

  if (!active || !payload || !payload.length) {
    return null;
  }
  const data = payload[0]?.payload;

  return (
    <div className="custom-tooltip">
      <div className="tooltip">{data._alias}</div>
      <div className="tooltip">
        Total area: {getArea(data.total_area, userData?.report_units, true)}
      </div>
      <div className="tooltip">
        Country area: {getArea(data.country_area, userData?.report_units, true)}
      </div>
      <div className="tooltip">
        Protected area: {getArea(data.current_protected_area, userData?.report_units, true)}
      </div>
    </div>
  );
};

export default CustomTooltip;
