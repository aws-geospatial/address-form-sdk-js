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
  /**
   * Optional base URL for map tile requests. Overrides the default
   * `https://maps.geo.{region}.amazonaws.com`. Used for custom or non-production endpoints.
   */
  mapsEndpointOverride?: string;
}

export function Map({
  mapStyle: extendedMapStyle = ["Standard", "Light"],
  politicalView,
  showNavigationControl = true,
  mapsEndpointOverride,
  children,
  ...rest
}: MapProps) {
  const { apiKey, region } = useAmazonLocationContext();

  return (
    <MapLibreMap
      mapStyle={getMapStyle(extendedMapStyle, region, apiKey, mapsEndpointOverride, politicalView)}
      validateStyle={false}
      style={{ width: "100%", height: "100%", borderRadius: 4 }}
      {...rest}
    >
      {showNavigationControl && <NavigationControl position="bottom-right" />}

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
  apiKey: string | undefined,
  mapsEndpointOverride: string | undefined,
  politicalView?: string,
): MapLibreMapProps["mapStyle"] => {
  if (Array.isArray(extendedMapStyle)) {
    const [mapStyle, colorScheme = "Light"] = extendedMapStyle;
    const baseUrl = mapsEndpointOverride || `https://maps.geo.${region}.amazonaws.com`;

    if (apiKey) {
      let mapStyleDescriptor = `${baseUrl}/v2/styles/${mapStyle}/descriptor?key=${apiKey}`;

      if (colorScheme && (mapStyle === "Standard" || mapStyle === "Monochrome")) {
        mapStyleDescriptor += `&color-scheme=${colorScheme}`;
      }

      if (politicalView) {
        mapStyleDescriptor += `&political-view=${politicalView}`;
      }

      return mapStyleDescriptor;
    }

    // No apiKey: build real URL for consumer's transformRequest to sign.
    let mapStyleDescriptor = `${baseUrl}/v2/styles/${mapStyle}/descriptor`;
    const params: string[] = [];

    if (colorScheme && (mapStyle === "Standard" || mapStyle === "Monochrome")) {
      params.push(`color-scheme=${colorScheme}`);
    }

    if (politicalView) {
      params.push(`political-view=${politicalView}`);
    }

    if (params.length > 0) {
      mapStyleDescriptor += `?${params.join("&")}`;
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
