import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.esm.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import { AuthProvider } from "./Auth";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "./components/ui/provider";
import { DarkMode, LightMode, useColorMode } from "@/components/ui/color-mode";
import { LoadScript } from "@react-google-maps/api";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* <App /> */}

    <AuthProvider>
      <BrowserRouter>
        <Provider>
          <LightMode>
            <LoadScript
              googleMapsApiKey={"AIzaSyBECI1LtDOO7wzXFu7yn7og0_NrRPEtISU"}
              libraries={["places"]}
            >
              <App />
            </LoadScript>
          </LightMode>
        </Provider>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
