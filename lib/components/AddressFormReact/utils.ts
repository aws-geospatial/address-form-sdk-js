export const getBoolean = (props: Record<string, unknown>, name: string) => {
  if (name in props) {
    return props[name] !== "false";
  }
};

export const getString = (props: Record<string, unknown>, name: string) => {
  if (name in props) {
    return String(props[name]);
  }
};
