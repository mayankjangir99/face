export const getDateKey = (date = new Date()) => {
  const timezone = process.env.APP_TIMEZONE || 'UTC';

  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
};

export const getRecentDateKeys = (days = 7) => {
  const dates = [];

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - index);
    dates.push(getDateKey(date));
  }

  return dates;
};
