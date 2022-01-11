export default function formatPrice(value: number | string) {
  if (typeof value === "number") {
    value = value.toFixed(2);
  }
  return value.replace(/\d(?=(\d{3})+\.)/g, "$&,");
}
