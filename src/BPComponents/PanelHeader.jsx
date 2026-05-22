import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const PanelHeader = ({ children, actions, sx, ...rest }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1,
      px: 2,
      py: 1.25,
      color: "primary.contrastText",
      background: (theme) => theme.palette.brand.barGradient,
      ...sx,
    }}
    {...rest}
  >
    <Typography
      component="div"
      sx={{
        flex: 1,
        fontFamily: (theme) => theme.typography.headingFont,
        fontSize: 20,
        lineHeight: 1.2,
        letterSpacing: "-0.01em",
        color: "inherit",
        minWidth: 0,
      }}
    >
      {children}
    </Typography>
    {actions ? (
      <Box sx={{ display: "flex", alignItems: "center" }}>{actions}</Box>
    ) : null}
  </Box>
);

export default PanelHeader;
