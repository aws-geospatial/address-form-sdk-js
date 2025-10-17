import MapLibreMap, { MapProps as MapLibreMapProps, NavigationControl } from "react-map-gl/maplibre";
import useAmazonLocationContext from "../../hooks/use-amazon-location-context";
import { Logo } from "../../icons/Logo";
import { logo } from "./styles.css";
import { getColorScheme, getMapStyleType } from "./utils";

export type ColorScheme = "Light" | "Dark";

export type MapStyleType = "Standard" | "Monochrome" | "Hybrid" | "Satellite";

type ExtendedMapStyle =
  | MapLibreMapProps["mapStyle"]
  | [MapStyleType, Extract<ColorScheme, "Light">]
  | [Extract<MapStyleType, "Standard" | "Monochrome">, Extract<ColorScheme, "Dark">];

export { type ExtendedMapStyle as MapStyle };

export interface MapProps extends Omit<MapLibreMapProps, "mapStyle"> {
  mapStyle: ExtendedMapStyle;
  politicalView?: string;
  showNavigationControl?: boolean;
}

export function Map({
  mapStyle: extendedMapStyle = ["Standard", "Light"],
  politicalView,
  showNavigationControl = true,
  children,
  ...rest
}: MapProps) {
  const { apiKey, region } = useAmazonLocationContext();

  return (
    <MapLibreMap
      mapStyle={getMapStyle(extendedMapStyle, region, apiKey, politicalView)}
      validateStyle={false}
      style={{ width: "100%", height: "100%", borderRadius: 4 }}
      {...rest}
    >
      {showNavigationControl && <NavigationControl />}

      <div className={logo}>
        <Logo mode={getLogoMode(extendedMapStyle)} />
      </div>

      {children}
    </MapLibreMap>
  );
}

const getMapStyle = (
  extendedMapStyle: ExtendedMapStyle,
  region: string,
  apiKey: string,
  politicalView?: string,
): MapLibreMapProps["mapStyle"] => {
  if (Array.isArray(extendedMapStyle)) {
    const [mapStyle, colorScheme = "Light"] = extendedMapStyle;
    let mapStyleDescriptor = `https://maps.geo.${region}.amazonaws.com/v2/styles/${mapStyle}/descriptor?key=${apiKey}`;

    if (colorScheme && (mapStyle === "Standard" || mapStyle === "Monochrome")) {
      mapStyleDescriptor += `&color-scheme=${colorScheme}`;
    }

    if (politicalView) {
      mapStyleDescriptor += `&political-view=${politicalView}`;
    }

    return mapStyleDescriptor;
  }

  return extendedMapStyle;
};

const getLogoMode = (extendedMapStyle: ExtendedMapStyle): ColorScheme => {
  const mapStyleType = getMapStyleType(extendedMapStyle);
  const colorScheme = getColorScheme(extendedMapStyle);
  return mapStyleType === "Standard" || mapStyleType === "Monochrome" ? (colorScheme ?? "Light") : "Dark";
};
