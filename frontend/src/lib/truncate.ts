/** Truncate a string to `max` characters, appending an ellipsis when it is shortened. */
export function truncate(value: string, max: number): string {
  if (value.length <= max) {
    return value;
  }

  return `${value.slice(0, max).trimEnd()}…`;
}
