import { createBrowserRouter } from "react-router";
import { Landing } from "./pages/Landing";
import { Dashboard } from "./pages/Dashboard";
import { Upload } from "./pages/Upload";
import { Results } from "./pages/Results";
import { PersonProfile } from "./pages/PersonProfile";
import { PersonList } from "./pages/PersonList";

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
    path: "/person/:id",
    Component: PersonProfile,
  },
  {
    path: "/persons",
    Component: PersonList,
  },
]);