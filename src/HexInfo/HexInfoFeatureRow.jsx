import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";

export const HexInfoFeatureRow = ({ row }) => {
  const name = row.alias || row.feature_name || "Unknown";
  const preprocessed = row.preprocessed ?? false;

  return (
    <TableRow>
      <TableCell sx={{ whiteSpace: "normal", wordBreak: "break-word" }}>
        {name}
      </TableCell>
      <TableCell>{row.created_by ?? "-"}</TableCell>
      <TableCell align="center">
        {preprocessed ? (
          <CheckCircleIcon sx={{ fontSize: 16, color: "success.main" }} />
        ) : (
          <CancelIcon sx={{ fontSize: 16, color: "text.disabled" }} />
        )}
      </TableCell>
    </TableRow>
  );
};
