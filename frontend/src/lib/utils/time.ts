/**
 * Formats a date into a relative time string (Vietnamese)
 * @param date - The date to format
 * @returns Formatted relative time string
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return 'Vừa xong';
  }

  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }

  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  }

  if (diffInDays === 1) {
    return `Hôm qua lúc ${formatTime(date)}`;
  }

  if (diffInDays < 7) {
    return `${diffInDays} ngày trước`;
  }

  // For older dates, show absolute date and time
  return formatAbsoluteDateTime(date);
}

/**
 * Formats time in HH:MM format
 */
function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Formats date and time in "DD/MM/YYYY, HH:MM" format
 */
export function formatAbsoluteDateTime(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const time = formatTime(date);
  return `${day}/${month}/${year}, ${time}`;
}

/**
 * Formats date in "DD tháng MM lúc HH:MM" format (Vietnamese style)
 */
export function formatVietnameseDateTime(date: Date): string {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const time = formatTime(date);
  return `${day} tháng ${month} lúc ${time}`;
}

/**
 * Formats date in "DD/M lúc HH:MM" format (short Vietnamese style)
 */
export function formatShortDateTime(date: Date): string {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const time = formatTime(date);
  return `${day}/${month} lúc ${time}`;
}

/**
 * Formats a date string to "DD/MM/YYYY" format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
