import { createBrowserRouter } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ErrorPage from "./pages/ErrorPage";
import Layout from "./pages/Layout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CoursePage from "./pages/CoursePage";
import AssignmentsPage from "./pages/course/AssignmentsPage";
import RosterPage from "./pages/course/RosterPage";
import ExtensionsPage from "./pages/course/ExtensionsPage";
import SettingsPage from "./pages/course/SettingsPage";
import ProtectedRoute from "./components/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "courses", element: <CoursePage /> },
      { path: "courses/:courseId/assignments", element: <AssignmentsPage /> },
      { path: "courses/assignments", element: <AssignmentsPage /> },
      { path: "courses/roster", element: <RosterPage /> },
      { path: "courses/extensions", element: <ExtensionsPage /> },
      { path: "courses/settings", element: <SettingsPage /> },
    ],
  },
]);

export default router;
