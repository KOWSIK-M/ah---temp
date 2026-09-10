export const addBusinessDays = (start, days) => {
  const date = new Date(start);
  let remaining = days;
  while (remaining > 0) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0) remaining -= 1;
  }
  return date;
};

export const estimateDelivery = (pincode, start = new Date()) => {
  if (!/^[1-9][0-9]{5}$/.test(pincode)) return null;
  const extra = Number(pincode.at(-1)) % 3;
  return { earliest: addBusinessDays(start, 3 + extra), latest: addBusinessDays(start, 5 + extra) };
};
