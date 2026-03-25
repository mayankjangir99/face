const shortDateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric'
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-IN', {
  dateStyle: 'medium',
  timeStyle: 'short'
});

const timeFormatter = new Intl.DateTimeFormat('en-IN', {
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit'
});

export const getLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const formatShortDate = (dateKey) => {
  if (!dateKey) {
    return '-';
  }

  return shortDateFormatter.format(new Date(`${dateKey}T00:00:00`));
};

export const formatDateTime = (dateValue) => {
  if (!dateValue) {
    return '-';
  }

  return dateTimeFormatter.format(new Date(dateValue));
};

export const formatTime = (dateValue) => {
  if (!dateValue) {
    return '-';
  }

  return timeFormatter.format(new Date(dateValue));
};

export const formatConfidence = (value) => `${Number(value || 0).toFixed(1)}%`;
