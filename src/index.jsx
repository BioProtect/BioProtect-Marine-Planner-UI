import "./index.css";

import App from "./App";
import CssBaseline from "@mui/material/CssBaseline";
import { Provider } from "react-redux";
import ReactDOM from "react-dom/client";
import { SnackbarProvider } from "notistack";
import { ThemeProvider } from "@mui/material/styles";
import brandTheme from "./theme";
import registerServiceWorker from "./registerServiceWorker";
import store from "@store/store";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <ThemeProvider theme={brandTheme}>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={5}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        variant="filled" // optional
        preventDuplicate
      >
        <App />
      </SnackbarProvider>
    </ThemeProvider>
  </Provider>
);

registerServiceWorker();
