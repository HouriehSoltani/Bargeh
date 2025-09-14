// Utility functions for Persian date and season conversion

export interface PersianSeasonYear {
  season: string;
  year: string;
  displayName: string;
  sortKey: number;
}

/**
 * Converts English term to Persian season and year
 * @param term - English term like "Fall 2024", "Spring 2024", etc.
 * @returns Persian season and year object
 */
export function convertTermToPersian(term: string | undefined | null): PersianSeasonYear {
  // Handle undefined, null, or empty terms
  if (!term || typeof term !== 'string') {
    return {
      season: 'نامشخص',
      year: 'نامشخص',
      displayName: 'نامشخص',
      sortKey: 0
    };
  }

  // Parse the term (e.g., "Fall 2024" -> season: "Fall", year: "2024")
  const parts = term.split(' ');
  const season = parts[0] || '';
  const year = parts[1] || '';

  // Convert English season to Persian
  const seasonMap: Record<string, string> = {
    'Fall': 'پاییز',
    'Spring': 'بهار',
    'Summer': 'تابستان',
    'Winter': 'زمستان',
    'Autumn': 'پاییز'
  };

  const persianSeason = seasonMap[season] || season;

  // Convert Gregorian year to Persian year (approximate)
  // This is a simplified conversion - for more accuracy, you might want to use a proper Persian calendar library
  const gregorianYear = parseInt(year);
  const persianYear = gregorianYear - 621; // Approximate conversion

  // Create display name
  const displayName = `${persianSeason} ${persianYear}`;

  // Create sort key (higher number = more recent)
  // We want more recent terms to appear first
  const seasonOrder = { 'پاییز': 4, 'زمستان': 3, 'تابستان': 2, 'بهار': 1 };
  const seasonWeight = seasonOrder[persianSeason as keyof typeof seasonOrder] || 0;
  const sortKey = (persianYear * 10) + seasonWeight;

  return {
    season: persianSeason,
    year: persianYear.toString(),
    displayName,
    sortKey
  };
}

/**
 * Groups courses by Persian season-year
 * @param courses - Array of courses with term property
 * @returns Object with Persian season-year as keys and courses as values
 */
export function groupCoursesByPersianTerm(courses: any[]): Record<string, any[]> {
  const grouped: Record<string, any[]> = {};

  courses.forEach(course => {
    const persianTerm = convertTermToPersian(course.term);
    const key = persianTerm.displayName;

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push({
      ...course,
      persianTerm
    });
  });

  return grouped;
}

/**
 * Gets sorted Persian terms (most recent first)
 * @param groupedCourses - Object with Persian terms as keys
 * @returns Array of Persian term keys sorted by recency
 */
export function getSortedPersianTerms(groupedCourses: Record<string, any[]>): string[] {
  return Object.keys(groupedCourses).sort((a, b) => {
    // Get the sort key from the first course in each group
    const aSortKey = groupedCourses[a][0]?.persianTerm?.sortKey || 0;
    const bSortKey = groupedCourses[b][0]?.persianTerm?.sortKey || 0;
    return bSortKey - aSortKey; // Descending order (most recent first)
  });
}

/**
 * Groups courses by term and year from database fields
 * @param courses - Array of courses with term and year properties
 * @returns Object with term-year as keys and courses as values
 */
export function groupCoursesByTermYear(courses: any[]): Record<string, any[]> {
  const grouped: Record<string, any[]> = {};

  courses.forEach(course => {
    const term = course.term || 'نامشخص';
    const year = course.year || 1400;
    const key = `${term} ${year}`;

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(course);
  });

  return grouped;
}

/**
 * Gets sorted term-year groups (most recent first)
 * @param groupedCourses - Object with term-year as keys
 * @returns Array of term-year keys sorted by recency
 */
export function getSortedTermYearGroups(groupedCourses: Record<string, any[]>): string[] {
  return Object.keys(groupedCourses).sort((a, b) => {
    // Parse term and year from keys like "بهار 1404"
    const parseTermYear = (key: string) => {
      const parts = key.split(' ');
      const term = parts[0] || '';
      const year = parseInt(parts[1]) || 0;
      
      // Season order: پاییز=4, زمستان=3, تابستان=2, بهار=1
      const seasonOrder: Record<string, number> = { 
        'پاییز': 4, 'زمستان': 3, 'تابستان': 2, 'بهار': 1, 'نامشخص': 0 
      };
      const seasonWeight = seasonOrder[term] || 0;
      
      return (year * 10) + seasonWeight;
    };

    const aSortKey = parseTermYear(a);
    const bSortKey = parseTermYear(b);
    return bSortKey - aSortKey; // Descending order (most recent first)
  });
}

/**
 * Filters courses by year threshold
 * @param courses - Array of courses
 * @param minYear - Minimum year to include (inclusive)
 * @returns Filtered array of courses
 */
export function filterCoursesByYear(courses: any[], minYear: number): any[] {
  return courses.filter(course => (course.year || 0) >= minYear);
}
