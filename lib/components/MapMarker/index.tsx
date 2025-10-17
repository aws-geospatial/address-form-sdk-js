import { useRef, useState } from "react";
import { Marker } from "react-map-gl/maplibre";
import { Button } from "../Button/index.tsx";
import { styleAdjustButtons, styleAdjustMarker, styleButton } from "./styles.css.ts";

export interface MapMarkerProps {
  adjustablePosition?: boolean;
  markerPosition?: [number, number];
  onSaveMarkerPosition?: (position: [number, number]) => void;
}

export function MapMarker({ adjustablePosition = true, markerPosition, onSaveMarkerPosition }: MapMarkerProps) {
  const markerRef = useRef<maplibregl.Marker>(null);
  const [isAdjustMode, setIsAdjustMode] = useState(false);

  const handleAdjustMarker = () => {
    setIsAdjustMode(true);
  };

  const handleSaveMarkerPosition = () => {
    if (onSaveMarkerPosition && markerRef.current) {
      const lngLat = markerRef.current.getLngLat();
      onSaveMarkerPosition([lngLat.lng, lngLat.lat]);
      setIsAdjustMode(false);
    }
  };

  const handleCancelAdjustMarker = () => {
    if (markerRef.current && markerPosition) {
      markerRef.current.setLngLat(markerPosition);
    }
    setIsAdjustMode(false);
  };

  if (markerPosition) {
    return (
      <div className={styleAdjustMarker}>
        {adjustablePosition && (
          <>
            {isAdjustMode ? (
              <div className={styleAdjustButtons}>
                <Button className={styleButton} size="small" onClick={handleSaveMarkerPosition}>
                  Set location
                </Button>

                <Button className={styleButton} size="small" variant="secondary" onClick={handleCancelAdjustMarker}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button className={styleButton} size="small" onClick={handleAdjustMarker}>
                Adjust marker
              </Button>
            )}
          </>
        )}

        <Marker
          draggable={adjustablePosition && isAdjustMode}
          longitude={markerPosition[0]}
          latitude={markerPosition[1]}
          anchor="bottom"
          color="black"
          ref={markerRef}
        />
      </div>
    );
  }
}
