import { 
  FiBook, 
  FiSettings, 
  FiLogOut,
  FiGrid, 
  FiFileText, 
  FiUsers, 
  FiClock,
  FiEdit3,
  FiCheckSquare,
  FiUpload,
  FiBarChart,
  FiArrowRight
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

// Assignment navigation config
export const getAssignmentNavigationConfig = (courseId: string, assignmentId: string, courseTitle?: string, assignmentTitle?: string): SidebarConfig => {
  return {
    type: 'assignment',
    title: assignmentTitle || 'Assignment',
    subtitle: courseTitle || 'Course',
    sections: [
      {
        items: [
          { icon: FiArrowRight, label: `بازگشت به ${courseTitle || 'درس'}`, href: `/courses/${courseId}`, path: `/courses/${courseId}` },
        ]
      },
      {
        items: [
          { icon: FiEdit3, label: "طرح کلی", href: `/courses/${courseId}/assignments/${assignmentId}/outline`, path: `/courses/${courseId}/assignments/${assignmentId}/outline` },
          { icon: FiUpload, label: "مدیریت ارسال‌ها", href: `/courses/${courseId}/assignments/${assignmentId}/submissions`, path: `/courses/${courseId}/assignments/${assignmentId}/submissions` },
          { icon: FiCheckSquare, label: "نمره‌دهی", href: `/courses/${courseId}/assignments/${assignmentId}/grade`, path: `/courses/${courseId}/assignments/${assignmentId}/grade` },
          { icon: FiBarChart, label: "بررسی نمرات", href: `/courses/${courseId}/assignments/${assignmentId}/grades`, path: `/courses/${courseId}/assignments/${assignmentId}/grades` },
        ]
      },
      {
        items: [
          { icon: FiClock, label: "درخواست‌های بازبینی", href: `/courses/${courseId}/assignments/${assignmentId}/regrade`, path: `/courses/${courseId}/assignments/${assignmentId}/regrade` },
          { icon: FiBarChart, label: "آمار", href: `/courses/${courseId}/assignments/${assignmentId}/statistics`, path: `/courses/${courseId}/assignments/${assignmentId}/statistics` },
          { icon: FiSettings, label: "تنظیمات", href: `/courses/${courseId}/assignments/${assignmentId}/settings`, path: `/courses/${courseId}/assignments/${assignmentId}/settings` },
        ]
      }
    ]
  };
};

// Function to get navigation config based on user role (simplified)
export const getNavigationConfig = (pathname: string, courseId?: string, userRole?: 'instructor' | 'student', courseTitle?: string, assignmentTitle?: string): SidebarConfig => {
  // Check if this is an assignment page (outline or submissions)
  const assignmentMatch = pathname.match(/^\/courses\/(\d+)\/assignments\/(\d+)\/(outline|submissions)/);
  if (assignmentMatch) {
    const [, courseId, assignmentId] = assignmentMatch;
    return getAssignmentNavigationConfig(courseId, assignmentId, courseTitle, assignmentTitle);
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
