import { createBrowserRouter } from "react-router-dom";
import ErrorPage from "./pages/ErrorPage";
import Layout from "./pages/Layout";
import LoginPage from "./pages/LoginPage";
import StudentSignupPage from "./pages/StudentSignupPage";
import RosterPage from "./pages/course/RosterPage";
import ExtensionsPage from "./pages/course/ExtensionsPage";
import SettingsPage from "./pages/course/SettingsPage";
import CreateAssignmentMerged from "./pages/assignments/CreateAssignmentPage";
import AssignmentOutlinePage from "./pages/assignments/AssignmentOutlinePage";
import ManageSubmissionsPage from "./pages/assignments/ManageSubmissionsPage";
import SubmissionOutlinePage from "./pages/assignments/SubmissionOutlinePage";
import ProfilePage from "./pages/ProfilePage";
import { RequireAuth } from "./components/RequireAuth";
import RoleBasedRouter from "./components/RoleBasedRouter";
import CourseRoleBasedRouter from "./components/CourseRoleBasedRouter";
import AssignmentsRoleBasedRouter from "./components/AssignmentsRoleBasedRouter";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <StudentSignupPage />,
  },
  {
    path: "/",
    element: (
      <RequireAuth>
        <Layout />
      </RequireAuth>
    ),
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <RoleBasedRouter /> },
      { path: "courses", element: <RoleBasedRouter /> },
      { path: "courses/:courseId", element: <CourseRoleBasedRouter /> },
      { path: "courses/:courseId/assignments", element: <AssignmentsRoleBasedRouter /> },
             {
               path: "courses/:courseId/assignments/new",
               element: <CreateAssignmentMerged />
             },
             {
               path: "courses/:courseId/assignments/:assignmentId/outline",
               element: <AssignmentOutlinePage />
             },
             {
               path: "courses/:courseId/assignments/:assignmentId/submissions",
               element: <ManageSubmissionsPage />
             },
             {
               path: "courses/:courseId/assignments/:assignmentId/submissions/:submissionId/outline",
               element: <SubmissionOutlinePage />
             },
      { 
        path: "courses/:courseId/roster", 
        element: <RosterPage />
      },
      { 
        path: "courses/:courseId/extensions", 
        element: <ExtensionsPage />
      },
      { 
        path: "courses/:courseId/settings", 
        element: <SettingsPage />
      },
      { path: "profile", element: <ProfilePage /> },
    ],
  },
]);

export default router;
