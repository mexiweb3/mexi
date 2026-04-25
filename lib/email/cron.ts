/**
 * Pure helpers for email cron windowing. SSR-safe and dependency-free.
 */

export type WeekWindow = {
  weekStart: Date;
  weekEnd: Date;
};

/**
 * Returns Monday 00:00:00.000 to Sunday 23:59:59.999 of the ISO week PRIOR
 * to `now`. ISO weeks start on Monday. All times are in UTC so the result is
 * stable across server regions.
 */
export function weeklySummaryWindow(now: Date): WeekWindow {
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );

  // getUTCDay: Sunday = 0, Monday = 1, ..., Saturday = 6.
  // Convert so Monday = 0, Sunday = 6.
  const dow = (today.getUTCDay() + 6) % 7;

  // Monday of the current ISO week.
  const thisMonday = new Date(today);
  thisMonday.setUTCDate(today.getUTCDate() - dow);

  // Monday of the previous ISO week.
  const weekStart = new Date(thisMonday);
  weekStart.setUTCDate(thisMonday.getUTCDate() - 7);
  weekStart.setUTCHours(0, 0, 0, 0);

  // Sunday 23:59:59.999 of the previous ISO week.
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
  weekEnd.setUTCHours(23, 59, 59, 999);

  return { weekStart, weekEnd };
}
