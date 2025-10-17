import { useQueryClient } from "@tanstack/react-query";
import { ComponentProps, useState } from "react";
import { Locate } from "../../icons/Locate.tsx";
import { reverseGeocodeQuery } from "../../utils/queries.ts";
import { TypeaheadOutput } from "../Typeahead/index.tsx";
import { styleButton } from "./styles.css.ts";
import useAmazonLocationContext from "../../hooks/use-amazon-location-context.ts";

interface LocateButtonProps extends ComponentProps<"button"> {
  onLocate: (address: TypeaheadOutput) => void;
  className?: string;
}

export function LocateButton({ onLocate, className = "", ...restProps }: LocateButtonProps) {
  const [isDisabled, setIsDisabled] = useState(false);
  const queryClient = useQueryClient();
  const { client } = useAmazonLocationContext();

  const getCurrentLocation = (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by your browser");
      setIsDisabled(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const result = await queryClient.ensureQueryData(
          reverseGeocodeQuery(client, {
            QueryPosition: [position.coords.longitude, position.coords.latitude],
          }),
        );

        if (result.ResultItems && result.ResultItems.length > 0) {
          const addressNumber = result.ResultItems[0].Address?.AddressNumber;
          const street = result.ResultItems[0].Address?.Street;
          const formattedAddressLineOne = addressNumber && street ? `${addressNumber} ${street}` : "";

          onLocate({
            addressLineOneField: formattedAddressLineOne,
            fullAddress: result.ResultItems[0].Address,
            position: result.ResultItems[0].Position as [number, number],
          });
        }
      },
      (err) => {
        console.error(`Error getting location: ${err.message}`);
        setIsDisabled(true);
      },
    );
  };

  return (
    <button
      onClick={getCurrentLocation}
      className={`${styleButton} ${className || ""}`}
      {...restProps}
      disabled={isDisabled}
      data-testid="aws-current-location"
    >
      <Locate />
    </button>
  );
}
