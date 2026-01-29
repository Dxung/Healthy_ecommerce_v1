/**
 * Format a given Date object to Vietnamese time string.
 * @param rawTime The Date object to format.
 * @param is24Hour Boolean indicating if the time should be in 24-hour format.
 * @returns The formatted Vietnamese time string.
 */
export function formatVNTime(rawTime: Date, is24Hour: boolean): string {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour12: !is24Hour,
  };
  return new Intl.DateTimeFormat('vi-VN', options)
    .format(rawTime)
    .replace(',', '');
}
