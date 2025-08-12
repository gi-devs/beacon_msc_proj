export function normaliseDate(date: Date): Date {
  date.setHours(0, 0, 0, 0); // Set time to midnight
  return date;
}
