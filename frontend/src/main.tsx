import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { LayoutProvider } from "./context/LayoutProvider";
import { DepartmentProvider } from "./context/DepartmentProvider";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <LayoutProvider>
        <DepartmentProvider>
          <App />
        </DepartmentProvider>
      </LayoutProvider>
    </AuthProvider>
  </BrowserRouter>
);
