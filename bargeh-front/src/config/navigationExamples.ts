// Example configurations for different page types
// This file demonstrates how to extend the navigation system

import { 
  FiFileText, 
  FiUsers, 
  FiClock, 
  FiSettings, 
  FiLogOut,
  FiGrid, 
  FiEdit,
  FiDownload,
  FiUpload,
  FiBarChart
} from "react-icons/fi";
import { type SidebarConfig } from "./navigation";

// Example: Assignments page with sub-navigation
export const assignmentsPageConfig: SidebarConfig = {
  type: 'course',
  title: "CIS_2910_01_W24",
  subtitle: "CIS*2910 (01) W24 - Discrete Structures in Comp II",
  sections: [
    {
      title: "Navigation",
      items: [
        { icon: FiGrid, label: "Dashboard", href: '/courses', path: '/courses' },
        { icon: FiFileText, label: "Assignments", href: '/courses/assignments', path: '/courses/assignments' },
        { icon: FiUsers, label: "Roster", href: '/courses/roster', path: '/courses/roster' },
        { icon: FiClock, label: "Extensions", href: '/courses/extensions', path: '/courses/extensions' },
        { icon: FiSettings, label: "Course Settings", href: '/courses/settings', path: '/courses/settings' },
      ]
    },
    {
      title: "Assignment Actions",
      items: [
        { icon: FiEdit, label: "Create Assignment", href: '/courses/assignments/create' },
        { icon: FiUpload, label: "Import Assignments", href: '/courses/assignments/import' },
        { icon: FiDownload, label: "Export Grades", href: '/courses/assignments/export' },
        { icon: FiBarChart, label: "Grade Statistics", href: '/courses/assignments/stats' },
      ]
    }
  ],
  instructors: [
    "Brooke Hiemstra",
    "Colby Parsons", 
    "Tricia Waite"
  ],
  courseActions: [
    { icon: FiLogOut, label: "Unenroll From Course", href: '/courses/unenroll' }
  ]
};

// Example: Roster page with student management actions
export const rosterPageConfig: SidebarConfig = {
  type: 'course',
  title: "CIS_2910_01_W24",
  subtitle: "CIS*2910 (01) W24 - Discrete Structures in Comp II",
  sections: [
    {
      title: "Navigation",
      items: [
        { icon: FiGrid, label: "Dashboard", href: '/courses', path: '/courses' },
        { icon: FiFileText, label: "Assignments", href: '/courses/assignments', path: '/courses/assignments' },
        { icon: FiUsers, label: "Roster", href: '/courses/roster', path: '/courses/roster' },
        { icon: FiClock, label: "Extensions", href: '/courses/extensions', path: '/courses/extensions' },
        { icon: FiSettings, label: "Course Settings", href: '/courses/settings', path: '/courses/settings' },
      ]
    },
    {
      title: "Student Management",
      items: [
        { icon: FiUsers, label: "Add Students", href: '/courses/roster/add' },
        { icon: FiUpload, label: "Import Roster", href: '/courses/roster/import' },
        { icon: FiDownload, label: "Export Roster", href: '/courses/roster/export' },
        { icon: FiBarChart, label: "Attendance Report", href: '/courses/roster/attendance' },
      ]
    }
  ],
  instructors: [
    "Brooke Hiemstra",
    "Colby Parsons", 
    "Tricia Waite"
  ],
  courseActions: [
    { icon: FiLogOut, label: "Unenroll From Course", href: '/courses/unenroll' }
  ]
};

// Example: Settings page with configuration options
export const settingsPageConfig: SidebarConfig = {
  type: 'course',
  title: "CIS_2910_01_W24",
  subtitle: "CIS*2910 (01) W24 - Discrete Structures in Comp II",
  sections: [
    {
      title: "Navigation",
      items: [
        { icon: FiGrid, label: "Dashboard", href: '/courses', path: '/courses' },
        { icon: FiFileText, label: "Assignments", href: '/courses/assignments', path: '/courses/assignments' },
        { icon: FiUsers, label: "Roster", href: '/courses/roster', path: '/courses/roster' },
        { icon: FiClock, label: "Extensions", href: '/courses/extensions', path: '/courses/extensions' },
        { icon: FiSettings, label: "Course Settings", href: '/courses/settings', path: '/courses/settings' },
      ]
    },
    {
      title: "Course Configuration",
      items: [
        { icon: FiEdit, label: "General Settings", href: '/courses/settings/general' },
        { icon: FiUsers, label: "Instructor Management", href: '/courses/settings/instructors' },
        { icon: FiClock, label: "Schedule Settings", href: '/courses/settings/schedule' },
        { icon: FiBarChart, label: "Grading Policies", href: '/courses/settings/grading' },
      ]
    }
  ],
  instructors: [
    "Brooke Hiemstra",
    "Colby Parsons", 
    "Tricia Waite"
  ],
  courseActions: [
    { icon: FiLogOut, label: "Unenroll From Course", href: '/courses/unenroll' }
  ]
};
