export const positionToString = ([lng, lat]: number[]) => {
  return [lng, lat].map((coord) => coord.toFixed(6)).join(",");
};

export const isSamePosition = (a: [number, number] | undefined, b: [number, number] | undefined): boolean => {
  if (!a || !b) return false;
  return a[0] === b[0] && a[1] === b[1];
};
