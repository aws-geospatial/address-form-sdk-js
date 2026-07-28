import { AutocompleteFilterPlaceType } from "@aws-sdk/client-geo-places";
import { FunctionComponent, useEffect } from "react";
import { createRoot } from "react-dom/client";
import useAmazonLocationContext from "../../hooks/use-amazon-location-context";
import { getPlace } from "../../utils/api";
import { AmazonLocationProvider } from "../AmazonLocationProvider";
import { Button } from "../Button";
import { ComponentInjector } from "../ComponentInjector";
import { ColorScheme, MapStyle, MapStyleType } from "../Map";
import type { SubmitHandler } from "./AddressForm";
import { AddressFormAddressField } from "./AddressFormAddressField";
import { AddressFormAutofillHandler } from "./AddressFormAutofillHandler";
import { useAddressFormContext } from "./AddressFormContext";
import { AddressFormCountryField } from "./AddressFormCountryField";
import { Field } from "./AddressFormFields";
import { AddressFormMap } from "./AddressFormMap";
import { AddressFormProvider } from "./AddressFormProvider";
import { AddressFormTextField } from "./AddressFormTextField";
import { SubmitButton } from "./SubmitButton";
import { getBoolean, getString } from "./utils";
import { NotificationContainer } from "../Notification";
import { createPortal } from "react-dom";
import type { CenterBounds } from "../../utils/bounds";

export interface RenderParams {
  root: string;
  apiKey: string;
  region: string;
  language?: string;
  politicalView?: string;
  showCurrentCountryResultsOnly?: boolean;
  allowedCountries?: string[];
  placeTypes?: AutocompleteFilterPlaceType[];
  onSubmit?: SubmitHandler;
  initialMapCenter?: [number, number];
  initialMapZoom?: number;
  centerBounds?: CenterBounds;
}

export const render = ({ root: selector, ...formProps }: RenderParams) => {
  const form = document.querySelector(selector) as HTMLFormElement;

  if (!form) {
    throw new Error(
      `Address form could not be initialized. No form element found matching selector "${selector}". Please ensure the form exists in the DOM before calling render().`,
    );
  }

  const formWrapper = document.createElement("div");

  const notificationContainer = document.createElement("div");
  formWrapper.appendChild(notificationContainer);

  form.parentElement?.appendChild(formWrapper);
  formWrapper.appendChild(form);

  const root = createRoot(ensureAddressFormRoot());

  root.render(
    <AmazonLocationProvider apiKey={formProps.apiKey} region={formProps.region}>
      <AddressFormProvider
        apiKey={formProps.apiKey}
        region={formProps.region}
        language={formProps.language}
        politicalView={formProps.politicalView}
        showCurrentCountryResultsOnly={formProps.showCurrentCountryResultsOnly}
        allowedCountries={formProps.allowedCountries}
        placeTypes={formProps.placeTypes}
        initialMapCenter={formProps.initialMapCenter}
        initialMapZoom={formProps.initialMapZoom}
        centerBounds={formProps.centerBounds}
      >
        <FormEventHandler selector={selector} onSubmit={formProps.onSubmit} />
        <AddressFormAutofillHandler form={form} />
        {createPortal(<NotificationContainer />, notificationContainer)}

        <ComponentInjector
          selector={selector}
          replacements={[
            {
              selector: `input[data-type="address-form"][name="${Field.ADDRESS_LINE_ONE}"]`,
              component: (element) => (
                <AddressFormAddressField
                  name={Field.ADDRESS_LINE_ONE}
                  label={element.ariaLabel ?? "Address"}
                  placeholder={element.getAttribute("placeholder") ?? "Enter address"}
                  className={element.className || undefined}
                  apiName={getString(element.dataset, "apiName") ?? "suggest"}
                  showCurrentLocation={getBoolean(element.dataset, "showCurrentLocation") ?? true}
                />
              ),
            },
            {
              selector: `input[data-type="address-form"][name="${Field.ADDRESS_LINE_TWO}"]`,
              component: (element) => (
                <AddressFormTextField
                  name={Field.ADDRESS_LINE_TWO}
                  label={element.ariaLabel ?? "Address Line 2"}
                  placeholder={element.getAttribute("placeholder") ?? "Apartment, suite, etc."}
                  className={element.className || undefined}
                />
              ),
            },
            {
              selector: `input[data-type="address-form"][name="${Field.CITY}"]`,
              component: (element) => (
                <AddressFormTextField
                  name={Field.CITY}
                  label={element.ariaLabel ?? "City"}
                  placeholder={element.getAttribute("placeholder") ?? undefined}
                  className={element.className || undefined}
                />
              ),
            },
            {
              selector: `input[data-type="address-form"][name="${Field.PROVINCE}"]`,
              component: (element) => (
                <AddressFormTextField
                  name={Field.PROVINCE}
                  label={element.ariaLabel ?? "Province/State"}
                  placeholder={element.getAttribute("placeholder") ?? undefined}
                  className={element.className || undefined}
                />
              ),
            },
            {
              selector: `input[data-type="address-form"][name="${Field.POSTAL_CODE}"]`,
              component: (element) => (
                <AddressFormTextField
                  name={Field.POSTAL_CODE}
                  label={element.ariaLabel ?? "Postal/Zip code"}
                  placeholder={element.getAttribute("placeholder") ?? undefined}
                  className={element.className || undefined}
                />
              ),
            },
            {
              selector: `input[data-type="address-form"][name="${Field.COUNTRY}"]`,
              component: (element) => (
                <AddressFormCountryField
                  name={Field.COUNTRY}
                  label={element.ariaLabel ?? "Country"}
                  placeholder={element.getAttribute("placeholder") ?? undefined}
                  className={element.className || undefined}
                />
              ),
            },
            {
              selector: 'div[data-type="address-form"][data-map-style]',
              component: (element) => (
                <AddressFormMap
                  mapStyle={validateMapStyle(getString(element.dataset, "mapStyle"))}
                  adjustablePosition={getBoolean(element.dataset, "adjustablePosition")}
                />
              ),
            },
            {
              selector: 'button[data-type="address-form"][type="submit"]',
              component: (element) => (
                <SubmitButton className={element.className || undefined}>{element.textContent}</SubmitButton>
              ),
            },
            {
              selector: 'button[data-type="address-form"][type="reset"]',
              component: (element) => (
                <Button type="reset" variant="secondary" className={element.className || undefined}>
                  {element.textContent}
                </Button>
              ),
            },
          ]}
        />
      </AddressFormProvider>
    </AmazonLocationProvider>,
  );
};

// Linter thinks it's not a component since we're returning `null`
// eslint-disable-next-line react-refresh/only-export-components
const FormEventHandler: FunctionComponent<{
  selector: string;
  onSubmit?: SubmitHandler;
}> = ({ selector, onSubmit }) => {
  const { data, setData, resetData, isAdjustedPositionOutOfBounds } = useAddressFormContext();
  const { client } = useAmazonLocationContext();

  useEffect(() => {
    const form = document.querySelector(selector) as HTMLFormElement;
    if (!form) return;

    const handleSubmit = (event: Event) => {
      event.preventDefault();

      // Block submission while the adjusted pin is outside the supported region.
      if (isAdjustedPositionOutOfBounds) return;

      onSubmit?.(async ({ intendedUse }) => {
        // If the user is going to store the results (even for caching purposes),
        // we must make another API call for the same place with the storage option.
        // See: https://docs.aws.amazon.com/location/latest/developerguide/places-intended-use.html
        if (intendedUse === "Storage" && data.placeId) {
          await getPlace(client, { PlaceId: data.placeId, IntendedUse: intendedUse });
        }

        return data;
      });
    };

    const handleReset = () => {
      resetData?.();
    };

    form.addEventListener("submit", handleSubmit);
    form.addEventListener("reset", handleReset);

    return () => {
      form.removeEventListener("submit", handleSubmit);
      form.removeEventListener("reset", handleReset);
    };
  }, [selector, data, setData, resetData, onSubmit, client, isAdjustedPositionOutOfBounds]);

  return null;
};

const validateMapStyle = (mapStyleString?: string): MapStyle => {
  if (!mapStyleString) return ["Standard", "Light"];

  const [style, scheme] = mapStyleString.split(",");
  const validStyles = ["Standard", "Monochrome", "Hybrid", "Satellite"] as const;
  const validSchemes = ["Light", "Dark"] as const;

  const isValidStyle = (s: string): s is MapStyleType => validStyles.includes(s as MapStyleType);
  const isValidScheme = (s: string): s is ColorScheme => validSchemes.includes(s as ColorScheme);

  const mapStyle = isValidStyle(style) ? style : "Standard";
  const colorScheme = isValidScheme(scheme) ? scheme : "Light";

  // Return valid combinations based on MapStyle type constraints
  if (colorScheme === "Dark") {
    if (mapStyle === "Standard" || mapStyle === "Monochrome") {
      return [mapStyle, "Dark"];
    }
    return ["Standard", "Dark"];
  }

  // For Light scheme, all styles are valid
  return [mapStyle, "Light"];
};

const ensureAddressFormRoot = (id = "aws-address-form-root"): HTMLElement => {
  return (
    document.getElementById(id) ??
    (() => {
      const root = document.createElement("div");
      root.id = id;
      document.body.appendChild(root);
      return root;
    })()
  );
};
