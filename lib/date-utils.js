export function formatDayMonthYear(value) {
  if (value == null) {
    return value;
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}-${month}-${date.getFullYear()}`;
}

export function formatDateTimeWithoutOffset(date) {
  const normalized = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(normalized.getTime())) {
    throw new Error("Invalid date");
  }
  const pad = (value) => String(value).padStart(2, "0");
  return `${normalized.getFullYear()}-${pad(normalized.getMonth() + 1)}-${pad(
    normalized.getDate()
  )}T${pad(normalized.getHours())}:${pad(normalized.getMinutes())}:${pad(normalized.getSeconds())}`;
}
