import { format } from 'date-fns';
import { enGB } from 'date-fns/locale';
export const formatShortDate = (date: Date): string => {
  return format(date, 'dd-MM-yyyy', { locale: enGB });
};

export const formateTo24HourTime = (date: Date): string => {
  return format(date, 'HH:mm', { locale: enGB });
};

export const getDayOfWeek = (date: Date): string => {
  return format(date, 'EEEE', { locale: enGB });
};
