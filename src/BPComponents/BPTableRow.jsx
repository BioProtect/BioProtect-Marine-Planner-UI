import { TableCell, TableRow } from "@mui/material";

import React from "react";

const BPTableRow = ({ val1, val2 }) => {
  return (
    <TableRow>
      <TableCell>{val1}</TableCell>
      <TableCell>{val2}</TableCell>
    </TableRow>
  );
};

export default BPTableRow;
