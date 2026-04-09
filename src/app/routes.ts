import { createBrowserRouter } from "react-router";
import { Landing } from "./pages/Landing";
import { Dashboard } from "./pages/Dashboard";
import { Upload } from "./pages/Upload";
import { Results } from "./pages/Results";
import { PatientProfile } from "./pages/PatientProfile";
import { PatientList } from "./pages/PatientList";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/dashboard",
    Component: Dashboard,
  },
  {
    path: "/upload",
    Component: Upload,
  },
  {
    path: "/results",
    Component: Results,
  },
  {
    path: "/patient/:id",
    Component: PatientProfile,
  },
  {
    path: "/patients",
    Component: PatientList,
  },
]);