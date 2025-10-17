export const positionToString = ([lng, lat]: number[]) => {
  return [lng, lat].map((coord) => coord.toFixed(6)).join(",");
};
