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
