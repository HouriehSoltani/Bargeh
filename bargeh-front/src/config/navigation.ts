import { 
  FiBook, 
  FiSettings, 
  FiLogOut,
  FiGrid, 
  FiFileText, 
  FiUsers, 
  FiClock
} from "react-icons/fi";

export interface NavigationItem {
  icon: any;
  label: string;
  href: string;
  path?: string;
}

export interface NavigationSection {
  title?: string;
  items: NavigationItem[];
}

export interface SidebarConfig {
  type: 'home' | 'course';
  title?: string;
  subtitle?: string;
  sections: NavigationSection[];
  courseActions?: NavigationItem[];
}

// Home page navigation configuration
export const homeNavigationConfig: SidebarConfig = {
  type: 'home',
  sections: [
    {
      items: [
        { icon: FiBook, label: "داشبورد درس‌ها", href: '/', path: '/' },
        { icon: FiSettings, label: "تنظیمات پروفایل", href: '/profile', path: '/profile' },
      ]
    }
  ]
};

// Course page navigation configuration
export const courseNavigationConfig: SidebarConfig = {
  type: 'course',
  sections: [
    {
      items: [
        { icon: FiGrid, label: "داشبورد", href: '/courses', path: '/courses' },
        { icon: FiFileText, label: "تکالیف", href: '/courses/assignments', path: '/courses/assignments' },
        { icon: FiUsers, label: "لیست دانشجویان", href: '/courses/roster', path: '/courses/roster' },
        { icon: FiClock, label: "تمدیدها", href: '/courses/extensions', path: '/courses/extensions' },
        { icon: FiSettings, label: "تنظیمات درس", href: '/courses/settings', path: '/courses/settings' },
      ]
    }
  ],
  courseActions: [
    { icon: FiLogOut, label: "انصراف از درس", href: '/courses/unenroll' }
  ]
};

// Function to get navigation config based on current path
export const getNavigationConfig = (pathname: string, courseId?: string): SidebarConfig => {
  if (pathname.startsWith('/courses')) {
    // If we have a courseId, create dynamic course navigation
    if (courseId) {
      return {
        type: 'course',
        sections: [
          {
            items: [
              { icon: FiGrid, label: "داشبورد", href: `/courses/${courseId}`, path: `/courses/${courseId}` },
              { icon: FiFileText, label: "تکالیف", href: `/courses/${courseId}/assignments`, path: `/courses/${courseId}/assignments` },
              { icon: FiUsers, label: "لیست دانشجویان", href: `/courses/${courseId}/roster`, path: `/courses/${courseId}/roster` },
              { icon: FiClock, label: "تمدیدها", href: `/courses/${courseId}/extensions`, path: `/courses/${courseId}/extensions` },
              { icon: FiSettings, label: "تنظیمات درس", href: `/courses/${courseId}/settings`, path: `/courses/${courseId}/settings` },
            ]
          }
        ],
        courseActions: [
          { icon: FiLogOut, label: "انصراف از درس", href: `/courses/${courseId}/unenroll` }
        ]
      };
    }
    return courseNavigationConfig;
  }
  return homeNavigationConfig;
};
