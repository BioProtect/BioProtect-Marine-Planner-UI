import { createTheme } from "@mui/material/styles";

const marine = {
  deep: "#091b35",
  primary: "#125085",
  mid: "#1e6a7a",
  teal: "#448188",
  tealDark: "#2b575c",
  green: "#5bbd8c",
  ink: "#2d3f4a",
  muted: "#9aabb5",
  border: "#dde4e8",
  surfaceTint: "#f8fafc",
};

const barGradient = `linear-gradient(130deg, ${marine.primary} 0%, ${marine.mid} 50%, ${marine.teal} 100%)`;
const panelGradient = `linear-gradient(135deg, ${marine.primary} 0%, ${marine.teal} 100%)`;
const headingFont = '"DM Serif Display", "Roboto Slab", Georgia, serif';
const bodyFont =
  '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const brandTheme = createTheme({
  palette: {
    primary: {
      light: marine.teal,
      main: marine.primary,
      dark: marine.deep,
      contrastText: "#ffffff",
    },
    secondary: {
      light: marine.green,
      main: marine.teal,
      dark: marine.tealDark,
      contrastText: "#ffffff",
    },
    brand: {
      deep: marine.deep,
      main: marine.primary,
      mid: marine.mid,
      teal: marine.teal,
      tealDark: marine.tealDark,
      green: marine.green,
      ink: marine.ink,
      muted: marine.muted,
      border: marine.border,
      surfaceTint: marine.surfaceTint,
      barGradient,
      panelGradient,
      contrastText: "#ffffff",
    },
    text: {
      primary: marine.ink,
      secondary: marine.muted,
    },
  },
  typography: {
    headingFont,
    fontFamily: bodyFont,
  },
  shape: {
    radius: 10,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundImage: barGradient,
          backgroundColor: marine.primary,
          color: "#ffffff",
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: 60,
          "@media (min-width:600px)": {
            minHeight: 60,
          },
        },
      },
    },
  },
});

export default brandTheme;
