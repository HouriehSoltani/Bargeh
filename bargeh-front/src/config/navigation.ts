import { 
  FiBook, 
  FiSettings, 
  FiLogOut,
  FiGrid, 
  FiFileText, 
  FiUsers, 
  FiClock,
  FiKey,
  FiEdit3,
  FiCheckSquare,
  FiUpload,
  FiBarChart
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
  type: 'home' | 'course' | 'assignment';
  title?: string;
  subtitle?: string;
  sections: NavigationSection[];
  courseActions?: NavigationItem[];
}

// Function to get navigation config based on user role
export const getHomeNavigationConfig = (userRole?: 'instructor' | 'student'): SidebarConfig => {
  if (userRole === 'student') {
    return {
      type: 'home',
      sections: [
        {
          items: [
            { icon: FiBook, label: "درس‌های من", href: '/', path: '/' },
            { icon: FiKey, label: "ثبت‌نام در درس", href: '/enroll', path: '/enroll' },
            { icon: FiSettings, label: "تنظیمات پروفایل", href: '/profile', path: '/profile' },
          ]
        }
      ]
    };
  }

  // Default for instructors (base system)
  return {
    type: 'home',
    sections: [
      {
        items: [
          { icon: FiBook, label: "داشبورد درس‌ها", href: '/', path: '/' },
          { icon: FiKey, label: "ثبت‌نام در درس", href: '/enroll', path: '/enroll' },
          { icon: FiSettings, label: "تنظیمات پروفایل", href: '/profile', path: '/profile' },
        ]
      }
    ]
  };
};

// Course page navigation configuration
export const courseNavigationConfig: SidebarConfig = {
  type: 'course',
  sections: [
    {
      items: [
        { icon: FiGrid, label: "داشبورد", href: '/courses', path: '/courses' },
        { icon: FiFileText, label: "تکالیف", href: '/courses/assignments', path: '/courses/assignments' },
        { icon: FiUsers, label: "لیست افراد", href: '/courses/roster', path: '/courses/roster' },
        { icon: FiClock, label: "تمدیدها", href: '/courses/extensions', path: '/courses/extensions' },
        { icon: FiSettings, label: "تنظیمات درس", href: '/courses/settings', path: '/courses/settings' },
      ]
    }
  ],
  courseActions: [
    { icon: FiLogOut, label: "انصراف از درس", href: '/courses/unenroll' }
  ]
};

// Assignment outline navigation config
export const getAssignmentOutlineNavigationConfig = (courseId: string, assignmentId: string): SidebarConfig => {
  return {
    type: 'assignment',
    sections: [
      {
        items: [
          { icon: FiEdit3, label: "ویرایش طرح کلی", href: `/courses/${courseId}/assignments/${assignmentId}/outline`, path: `/courses/${courseId}/assignments/${assignmentId}/outline` },
          { icon: FiCheckSquare, label: "ایجاد روبریک", href: `/courses/${courseId}/assignments/${assignmentId}/rubric`, path: `/courses/${courseId}/assignments/${assignmentId}/rubric` },
          { icon: FiUpload, label: "مدیریت اسکن‌ها", href: `/courses/${courseId}/assignments/${assignmentId}/scans`, path: `/courses/${courseId}/assignments/${assignmentId}/scans` },
          { icon: FiFileText, label: "مدیریت ارسال‌ها", href: `/courses/${courseId}/assignments/${assignmentId}/submissions`, path: `/courses/${courseId}/assignments/${assignmentId}/submissions` },
          { icon: FiBarChart, label: "بررسی نمرات", href: `/courses/${courseId}/assignments/${assignmentId}/grades`, path: `/courses/${courseId}/assignments/${assignmentId}/grades` },
        ]
      }
    ],
    courseActions: [
      { icon: FiLogOut, label: "بازگشت به تکالیف", href: `/courses/${courseId}/assignments` }
    ]
  };
};

// Function to get navigation config based on user role (simplified)
export const getNavigationConfig = (pathname: string, courseId?: string, userRole?: 'instructor' | 'student'): SidebarConfig => {
  // Check if this is an assignment outline page
  const assignmentOutlineMatch = pathname.match(/^\/courses\/(\d+)\/assignments\/(\d+)\/outline/);
  if (assignmentOutlineMatch) {
    const [, courseId, assignmentId] = assignmentOutlineMatch;
    return getAssignmentOutlineNavigationConfig(courseId, assignmentId);
  }

  if (pathname.startsWith('/courses')) {
    // If we have a courseId, create dynamic course navigation
    if (courseId) {
      // Students see limited navigation
      if (userRole === 'student') {
        return {
          type: 'course',
          sections: [
            {
              items: [
                { icon: FiGrid, label: "داشبورد", href: `/courses/${courseId}`, path: `/courses/${courseId}` },
                { icon: FiFileText, label: "تکالیف", href: `/courses/${courseId}/assignments`, path: `/courses/${courseId}/assignments` },
              ]
            }
          ],
          courseActions: [
            { icon: FiLogOut, label: "انصراف از درس", href: `/courses/${courseId}/unenroll` }
          ]
        };
      }

      // Instructors see full navigation (everything)
      return {
        type: 'course',
        sections: [
          {
            items: [
              { icon: FiGrid, label: "داشبورد", href: `/courses/${courseId}`, path: `/courses/${courseId}` },
              { icon: FiFileText, label: "تکالیف", href: `/courses/${courseId}/assignments`, path: `/courses/${courseId}/assignments` },
              { icon: FiUsers, label: "لیست افراد", href: `/courses/${courseId}/roster`, path: `/courses/${courseId}/roster` },
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
  return getHomeNavigationConfig(userRole);
};
