import CONSTANTS from "../../constants";
import React from "react";

const Step0 = ({ setShape, shape, style, setAreakm2, areakm2 }) => {
  return (
    <>
      <div>Choose the shape and size of the planning units</div>
      <Select
        onChange={(e) => setShape(e.target.value)}
        value={shape}
        // style={style}
        label="Planning unit shape"
      >
        {CONSTANTS.SHAPES.map((item) => (
          <MenuItem value={item} key={item}>
            {item}
          </MenuItem>
        ))}
      </Select>
      <br />
      <Select
        onChange={(e) => setAreakm2(e.target.value)}
        value={areakm2}
        // style={style}
        label="Area of each planning unit"
      >
        {CONSTANTS.AREAKM2S.map((item) => (
          <MenuItem value={item} key={item}>
            {item} Km2
          </MenuItem>
        ))}
      </Select>
    </>
  );
};

export default Step0;
