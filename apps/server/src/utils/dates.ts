export function normaliseDate(date: Date): Date {
  date.setUTCHours(0, 0, 0, 0); // Set time to midnight
  return date;
}
