import { 
  FiHome, 
  FiBook, 
  FiCalendar, 
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
  instructors?: string[];
  courseActions?: NavigationItem[];
}

// Home page navigation configuration
export const homeNavigationConfig: SidebarConfig = {
  type: 'home',
  sections: [
    {
      items: [
        { icon: FiHome, label: "میز کار", href: '/' },
        { icon: FiBook, label: "داشبورد دوره‌ها", href: '/courses' },
        { icon: FiCalendar, label: "پاییز ۱۴۰۳", href: '/fall-2024' },
        { icon: FiSettings, label: "تنظیمات", href: '/settings' },
      ]
    }
  ]
};

// Course page navigation configuration
export const courseNavigationConfig: SidebarConfig = {
  type: 'course',
  title: "آزمایشگاه ریز پردازنده_01_4032",
  subtitle: "آزمایشگاه ریز پردازنده - ترم بهار 1403/1404",
  sections: [
    {
      items: [
        { icon: FiGrid, label: "داشبورد", href: '/courses', path: '/courses' },
        { icon: FiFileText, label: "تمرین‌ها", href: '/courses/assignments', path: '/courses/assignments' },
        { icon: FiUsers, label: "لیست دانشجویان", href: '/courses/roster', path: '/courses/roster' },
        { icon: FiClock, label: "تمدیدها", href: '/courses/extensions', path: '/courses/extensions' },
        { icon: FiSettings, label: "تنظیمات درس", href: '/courses/settings', path: '/courses/settings' },
      ]
    }
  ],
  instructors: [
    "دکتر احمدی",
    "دکتر محمدی", 
    "دکتر رضایی"
  ],
  courseActions: [
    { icon: FiLogOut, label: "انصراف از درس", href: '/courses/unenroll' }
  ]
};

// Function to get navigation config based on current path
export const getNavigationConfig = (pathname: string): SidebarConfig => {
  if (pathname.startsWith('/courses')) {
    return courseNavigationConfig;
  }
  return homeNavigationConfig;
};
