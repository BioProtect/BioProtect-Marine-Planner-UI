import "./index.css";
import "typeface-roboto";

import App from "./App";
import { Provider } from "react-redux";
import ReactDOM from "react-dom/client";
import registerServiceWorker from "./registerServiceWorker";
import store from "./store";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>
);
registerServiceWorker();
