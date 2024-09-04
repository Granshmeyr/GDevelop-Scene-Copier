export const prefix = "♻️";

export function removePrefix(str, prefix) {
  const regex = new RegExp(`^${prefix}`);
  return str.replace(regex, "");
}

export function isPrefixed(str, prefix) {
  return new RegExp(`^${prefix}`).test(str);
}
