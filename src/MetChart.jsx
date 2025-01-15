import { Cell, Pie, PieChart } from "recharts";
import { useDispatch, useSelector } from "react-redux";

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import React from "react";
import Typography from "@mui/material/Typography";
import { getArea } from "./Helpers";
import { selectUserData } from "./slices/authSlice";

const MetChart = ({
  title,
  current_protected_percent,
  current_protected_area,
  country_area,
  total_area,
  showCountryArea = false,
  color = "#D9D9D9",
  clickable = true,
}) => {
  const rounded = Number(current_protected_percent.toFixed(1));
  const countryAreaValue = getArea(country_area, userData.report_units, false);
  const protectedAreaValue = getArea(current_protected_area, userData.report_units, false);
  const totalAreaValue = getArea(total_area, userData.report_units, false);
  const userData = useSelector(selectUserData);
  const titleText = `
    Total area: ${totalAreaValue}
    Country area: ${countryAreaValue}
    Protected area: ${protectedAreaValue}
  `;

  const data = showCountryArea
    ?
    [
      { name: "Protected area", value: current_protected_area },
      { name: "Country area", value: country_area - current_protected_area },
      { name: "Total area", value: total_area - country_area },
    ]
    : [
      { name: "Protected area", value: current_protected_area },
      { name: "Total area", value: country_area - current_protected_area },
    ];

  const colors = ["#D9D9D9", color];

  return (
    <Box className="MetChart">
      <Typography variant="h6" className="MetChartTitle" gutterBottom>
        {title}
      </Typography>
      <Divider />
      <Box className="MetChartInner" sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <PieChart width={120} height={120}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            isAnimationActive={false}
            startAngle={90}
            endAngle={450}
            innerRadius={30}
            outerRadius={50}
          >
            {data.map((entry, index) => {
              let _color;
              switch (index) {
                case 0:
                  _color = color;
                  break;
                case 1:
                  _color = showCountryArea ? "#bbbbbb" : "#dddddd";
                  break;
                default:
                  _color = "#dddddd";
                  break;
              }
              return <Cell key={index} fill={_color} strokeWidth={2} />;
            })}
          </Pie>
        </PieChart>
        <Typography
          variant="h4"
          className="MetChartPercentLabel"
          sx={{ color: colors[1], marginTop: 1 }}
        >
          {rounded}%
        </Typography>
        <Box
          className="MetChartDiv"
          sx={{ cursor: clickable ? "pointer" : "default" }}
          title={titleText.trim()}
        />
      </Box>
    </Box>
  );
};

export default MetChart;
