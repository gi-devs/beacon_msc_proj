import { format } from 'date-fns';
import { enGB } from 'date-fns/locale';
export const formatShortDate = (date: Date, slash?: boolean): string => {
  if (slash) {
    return format(date, 'dd/MM/yyyy', { locale: enGB });
  }
  return format(date, 'dd-MM-yyyy', { locale: enGB });
};

export const formateTo24HourTime = (date: Date): string => {
  return format(date, 'HH:mm', { locale: enGB });
};

export const getDayOfWeek = (date: Date): string => {
  return format(date, 'EEEE', { locale: enGB });
};

export const getFullDateString = (date: Date): string => {
  return format(date, 'MMMM do, yyyy', { locale: enGB });
};
