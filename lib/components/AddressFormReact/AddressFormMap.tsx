import { FunctionComponent } from "react";
import { Map, MapProps } from "../Map";
import { MapMarker, MapMarkerProps } from "../MapMarker";
import { useAddressFormContext } from "./AddressFormContext";
import { parsePosition } from "./utils";
import { getColorScheme } from "../Map/utils";
import { useNotificationStore } from "../../stores/notificationStore";

export type AddressFormMapProps = MapProps & Pick<MapMarkerProps, "adjustablePosition">;

export const AddressFormMap: FunctionComponent<AddressFormMapProps> = ({
  adjustablePosition = true,
  children,
  ...mapProps
}) => {
  const { data, setData, mapViewState, setMapViewState } = useAddressFormContext();
  const addNotification = useNotificationStore((state) => state.addNotification);

  const originalPosition = parsePosition(data.originalPosition ?? "");
  const hasAdjustedPosition = Boolean(data.adjustedPosition);

  const handleMove = ({ viewState }: { viewState: { longitude: number; latitude: number; zoom: number } }) => {
    setMapViewState(viewState);

    if (!originalPosition || !adjustablePosition) return;

    const [origLng, origLat] = originalPosition;
    const movedAway =
      Math.abs(viewState.longitude - origLng) > 0.0001 || Math.abs(viewState.latitude - origLat) > 0.0001;

    if (movedAway) {
      setData({ adjustedPosition: `${viewState.longitude},${viewState.latitude}` });
    } else {
      setData({ adjustedPosition: undefined });
    }
  };

  const handleReset = () => {
    if (originalPosition && mapViewState) {
      setMapViewState({ ...mapViewState, longitude: originalPosition[0], latitude: originalPosition[1] });
      setData({ adjustedPosition: undefined });
    }
  };

  const handleMapError = (error: unknown) => {
    if (error && typeof error === "object" && "error" in error) {
      const innerError = error.error as { status?: number };

      if (innerError?.status === 403) {
        addNotification(
          {
            id: "map-permission-error",
            type: "error",
            message: "Map rendering is currently unavailable.",
          },
          () => {
            console.error(
              "Map rendering failed: This is likely due to missing GetTile permissions in the API key configuration. See https://docs.aws.amazon.com/location/latest/developerguide/address-form-sdk.html#address-form-getting-started for API key setup instructions.",
              error,
            );
          },
        );
      }
    }
  };

  return (
    <Map {...mapViewState} onMove={handleMove} onError={handleMapError} {...mapProps}>
      {originalPosition && (
        <MapMarker
          adjustablePosition={adjustablePosition}
          markerPosition={originalPosition}
          hasAdjustedPosition={hasAdjustedPosition}
          onReset={handleReset}
          colorScheme={getColorScheme(mapProps.mapStyle)}
        />
      )}
      {children}
    </Map>
  );
};
