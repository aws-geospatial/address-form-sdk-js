import { ColorScheme, MapStyle, MapStyleType } from ".";

export const getMapStyleType = (extendedMapStyle: MapStyle, defaultValue: MapStyleType = "Standard"): MapStyleType => {
  if (Array.isArray(extendedMapStyle)) {
    const [mapStyleType] = extendedMapStyle;
    return mapStyleType ?? defaultValue;
  }

  if (typeof extendedMapStyle === "string") {
    try {
      const url = new URL(extendedMapStyle);
      const styleName = url.pathname.slice(1); // Remove leading '/'
      return (styleName as MapStyleType) || defaultValue;
    } catch {
      return defaultValue;
    }
  }

  return defaultValue;
};

export const getColorScheme = (extendedMapStyle: MapStyle, defaultValue: ColorScheme = "Light"): ColorScheme => {
  if (Array.isArray(extendedMapStyle)) {
    const [, colorScheme] = extendedMapStyle;
    return colorScheme ?? defaultValue;
  }

  if (typeof extendedMapStyle === "string") {
    try {
      const url = new URL(extendedMapStyle);
      const colorScheme = url.searchParams.get("color-scheme");
      return colorScheme === "Dark" ? "Dark" : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  return defaultValue;
};
