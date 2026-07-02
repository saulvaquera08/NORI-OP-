const currencyFormatter = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});

const currencyFormatter2 = new Intl.NumberFormat("es-MX", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatMoney(value: number) {
  return currencyFormatter.format(Math.round(value));
}

export function formatMoney2(value: number) {
  return currencyFormatter2.format(value);
}

const timeFormatter = new Intl.DateTimeFormat("es-MX", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatTime(iso: string) {
  return timeFormatter.format(new Date(iso));
}

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "short",
});

export function formatShortDate(iso: string) {
  return dateFormatter.format(new Date(iso)).replace(".", "");
}

export function dateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}
