import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "@/components/ui/provider";
import "./index.css";

import { RouterProvider } from "react-router-dom";
import router from "./routes.tsx";

// Suppress React key warning from @react-shamsi/datepicker library
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' && 
    args[0].includes('Each child in a list should have a unique "key" prop') &&
    (args[0].includes('MainBody') || args[0].includes('@react-shamsi_datepicker'))
  ) {
    // Suppress this specific warning from the datepicker library
    return;
  }
  originalConsoleError.apply(console, args);
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider forcedTheme="light">
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);
