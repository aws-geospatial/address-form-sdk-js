import { useQueryClient } from "@tanstack/react-query";
import { ComponentProps, useState } from "react";
import { Locate } from "../../icons/Locate.tsx";
import { reverseGeocodeQuery } from "../../utils/queries.ts";
import { useNotificationStore } from "../../stores/notificationStore.ts";
import { TypeaheadOutput } from "../Typeahead/index.tsx";
import { Tooltip } from "../Tooltip/index.tsx";
import { styleButton } from "./styles.css.ts";
import useAmazonLocationContext from "../../hooks/use-amazon-location-context.ts";
import { isCenterWithinBounds, type CenterBounds } from "../../utils/bounds.ts";

interface LocateButtonProps extends ComponentProps<"button"> {
  onLocate: (address: TypeaheadOutput) => void;
  className?: string;
  // Optional supported-region box. A device outside it is reported to the user rather than
  // looked up, so the field never fills with an in-region address the user is not standing at.
  queryBounds?: CenterBounds;
}

export function LocateButton({ onLocate, className = "", queryBounds, ...restProps }: LocateButtonProps) {
  const [isDisabled, setIsDisabled] = useState(false);
  const queryClient = useQueryClient();
  const { client } = useAmazonLocationContext();
  const addNotification = useNotificationStore((state) => state.addNotification);

  const getCurrentLocation = (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by your browser");
      setIsDisabled(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const queryPosition: [number, number] = [position.coords.longitude, position.coords.latitude];

        // Clamping an out-of-region device into the box would return a real in-region address
        // and present it as the user's location, so report it instead of looking it up.
        if (!isCenterWithinBounds(queryPosition, queryBounds)) {
          addNotification({ message: "Your current location is outside the supported region", type: "warning" });
          return;
        }

        const result = await queryClient.ensureQueryData(
          reverseGeocodeQuery(client, {
            QueryPosition: queryPosition,
          }),
        );

        if (result.ResultItems && result.ResultItems.length > 0) {
          const addressNumber = result.ResultItems[0].Address?.AddressNumber;
          const street = result.ResultItems[0].Address?.Street;
          const formattedAddressLineOne = addressNumber && street ? `${addressNumber} ${street}` : "";

          onLocate({
            placeId: result.ResultItems[0].PlaceId,
            addressLineOneField: formattedAddressLineOne,
            fullAddress: result.ResultItems[0].Address,
            position: result.ResultItems[0].Position as [number, number],
          });
        } else {
          addNotification({ message: "No results found for your current location", type: "warning" });
        }
      },
      (err) => {
        console.error(`Error getting location: ${err.message}`);
        setIsDisabled(true);
      },
    );
  };

  return (
    <Tooltip text="Current location is unavailable" show={isDisabled}>
      <button
        onClick={getCurrentLocation}
        className={`${styleButton} ${className || ""}`}
        {...restProps}
        disabled={isDisabled}
        data-testid="aws-current-location"
      >
        <Locate />
      </button>
    </Tooltip>
  );
}
