import "./index.css";
import "typeface-roboto";

import App from "./App";
import { Provider } from "react-redux";
import ReactDOM from "react-dom/client";
import { SnackbarProvider } from "notistack";
import registerServiceWorker from "./registerServiceWorker";
import store from "./store";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <SnackbarProvider
      maxSnack={5}
      autoHideDuration={5000}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      variant="filled" // optional
      preventDuplicate
    >
      <App />
    </SnackbarProvider>
  </Provider>
);

registerServiceWorker();
