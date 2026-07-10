import type { AutocompleteFilterPlaceType, Address } from "@aws-sdk/client-geo-places";
import clsx from "clsx";
import { ComponentProps, FormEventHandler, useRef, useState } from "react";
import type { Config } from "../../types/config.ts";
import { getIncludeCountriesFilter } from "../../utils/country-filter.ts";
import { Button } from "../Button";
import { CountrySelect } from "../CountrySelect/index.tsx";
import { FormField } from "../FormField";
import { Input } from "../Input";
import { Map, MapProps, MapStyle } from "../Map";
import { MapMarker } from "../MapMarker/index.tsx";
import { Typeahead, TypeaheadOutput, TypeaheadProps } from "../Typeahead";
import { TypeaheadAPIName } from "../Typeahead/use-typeahead-query.ts";
import * as styles from "./styles.css.ts";
import { isSamePosition, positionToString } from "../../utils/position.ts";
import { countries, getColorScheme } from "../../main.tsx";
import { defaultAddressFormFields, FormFieldID } from "./form-field.ts";

export interface AddressFormData {
  addressLineOne?: string;
  addressLineTwo?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  originalPosition?: string;
  adjustedPosition?: string;
  addressDetails?: Address;
}

export type AddressFormField = {
  id: FormFieldID;
  name: keyof AddressFormData;
  label: string;
  placeholder?: string;
};

export interface AddressFormProps {
  onSubmit?: (data: AddressFormData) => void;
  fields: AddressFormField[];
  typeahead: Config<
    TypeaheadProps,
    {
      apiName: TypeaheadAPIName | null;
      showCurrentLocation?: boolean;
      showCurrentCountryResultsOnly?: boolean;
      placeTypes?: Array<AutocompleteFilterPlaceType>;
      allowedCountries?: string[];
    }
  >;
  map?: Config<
    AddressFormMapProps,
    {
      mapStyle?: MapStyle;
      position?: "right" | "left";
      showAdjustPosition?: boolean;
      hide?: boolean;
      center?: number[];
      zoom?: number;
    }
  >;
  className?: string;
  language?: string;
  politicalView?: string;
}

export function AddressForm({
  fields = defaultAddressFormFields,
  typeahead,
  map,
  politicalView,
  language,
  className = "",
  onSubmit,
}: AddressFormProps) {
  const AddressFormMapComponent = map?.component ?? AddressFormMap;
  const TypeaheadComponent = typeahead?.component ?? Typeahead;

  const getDefaultCenter = () => {
    if (map?.center) {
      return map.center;
    }

    if (typeahead.allowedCountries?.length === 1) {
      return countries.find((country) => country.code === typeahead.allowedCountries?.[0])?.position;
    }
  };

  const getDefaultZoom = (center?: number[]) => {
    if (map?.zoom) {
      return map.zoom;
    }

    return center ? 5 : 1;
  };

  const [viewState, setViewState] = useState(() => {
    const center = getDefaultCenter();
    return { longitude: center?.[0] ?? -100, latitude: center?.[1] ?? 50, zoom: getDefaultZoom(center) };
  });

  const [markerPosition, setMarkerPosition] = useState<[number, number]>();
  const [formState, setFormState] = useState<Partial<AddressFormData>>({});

  const handleFormSubmit: FormEventHandler = (e) => {
    e.preventDefault();

    onSubmit?.({
      addressLineOne: formState.addressLineOne ?? "",
      addressLineTwo: formState.addressLineTwo ?? "",
      city: formState.city ?? "",
      province: formState.province ?? "",
      postalCode: formState.postalCode ?? "",
      country: formState.country ?? "",
      originalPosition: formState.originalPosition ?? "",
      adjustedPosition: formState.adjustedPosition ?? "",
      addressDetails: formState.addressDetails,
    });
  };

  const handleTypeaheadSelect = (value: TypeaheadOutput) => {
    setFormState((state) => ({
      ...state,
      addressLineOne: value.addressLineOneField,
      addressLineTwo: value.addressLineTwoField,
    }));

    // Only updating these fields if they're address information from API call
    if (!value.fullAddress) {
      return;
    }

    setFormState((state) => ({
      ...state,
      city: value.fullAddress?.Locality,
      postalCode: value.fullAddress?.PostalCode,
      province: value.fullAddress?.Region?.Name,
      country: value.fullAddress?.Country?.Code2,
      originalPosition: value.position ? positionToString(value.position) : "",
      adjustedPosition: undefined,
      addressDetails: value.fullAddress,
    }));

    // Draw marker on map
    if (value.position) {
      setViewState({ longitude: value.position?.[0], latitude: value.position?.[1], zoom: 15 });
      setMarkerPosition([value.position?.[0], value.position?.[1]]);
    }
  };

  const handleResetFields = () => {
    setMarkerPosition(undefined);
    setFormState({});
  };

  const handleSaveMarkerPosition = (position: [number, number]) => {
    const posString = positionToString(position);
    setFormState((state) => ({
      ...state,
      adjustedPosition: posString === state.originalPosition ? undefined : posString,
    }));

    setMarkerPosition(position);
  };

  const register = (name: keyof AddressFormData): ComponentProps<"input"> => {
    if (name === "addressDetails") {
      return {};
    }

    return {
      value: formState[name] ?? "",
      onChange: (e) => setFormState((state) => ({ ...state, [name]: e.target.value })),
    };
  };

  return (
    <div className={clsx(className, styles.base, map?.position === "left" && styles.reversed)}>
      <form className={styles.form} onSubmit={handleFormSubmit}>
        <div className={styles.formElements}>
          {fields.map((config) => {
            return (
              <FormField key={config.id} label={config.label} id={config.id}>
                {config.id === FormFieldID.ADDRESS_LINE_ONE ? (
                  <TypeaheadComponent
                    id={config.id}
                    name={config.id}
                    value={formState.addressLineOne ?? ""}
                    onChange={(addressLineOne) => setFormState((state) => ({ ...state, addressLineOne }))}
                    onSelect={handleTypeaheadSelect}
                    placeholder={config.placeholder}
                    showCurrentLocation={typeahead.showCurrentLocation}
                    apiName={typeahead.apiName}
                    apiInput={{
                      PoliticalView: politicalView,
                      Language: language,
                      BiasPosition: [viewState.longitude, viewState.latitude],
                      Filter: {
                        ...(typeahead.placeTypes &&
                          typeahead.placeTypes.length > 0 && {
                            IncludePlaceTypes: typeahead.placeTypes,
                          }),
                        IncludeCountries: getIncludeCountriesFilter(
                          typeahead.showCurrentCountryResultsOnly,
                          formState.country,
                          typeahead.allowedCountries,
                        ),
                      },
                    }}
                    debounce={300}
                    {...typeahead.props}
                  />
                ) : config.id === FormFieldID.COUNTRY ? (
                  <CountrySelect
                    id={config.id}
                    value={formState.country ?? null}
                    onChange={(country) => setFormState((state) => ({ ...state, country: country ?? undefined }))}
                    allowedCountries={typeahead.allowedCountries}
                  />
                ) : (
                  <Input
                    id={config.id}
                    data-testid={config.id}
                    {...register(config.name)}
                    placeholder={config.placeholder}
                  />
                )}
              </FormField>
            );
          })}

          <Input
            type="hidden"
            id={FormFieldID.ADJUSTED_POSITION}
            data-testid={FormFieldID.ADJUSTED_POSITION}
            {...register("adjustedPosition")}
            readOnly
          />

          <div className={styles.formButtons}>
            <Button type="submit">Submit</Button>

            <Button variant="secondary" onClick={handleResetFields}>
              Reset
            </Button>
          </div>
        </div>
      </form>

      {map?.hide ? null : (
        <AddressFormMapComponent
          {...viewState}
          mapStyle={map?.mapStyle}
          onMove={(evt) => setViewState(evt.viewState)}
          style={{ width: "50%", aspectRatio: "1/1" }}
          politicalView={politicalView}
          markerPosition={markerPosition}
          onSaveMarkerPosition={handleSaveMarkerPosition}
          adjustablePosition={map?.showAdjustPosition ?? true}
          {...map?.props}
        />
      )}
    </div>
  );
}

export interface AddressFormMapProps extends MapProps {
  adjustablePosition?: boolean;
  markerPosition?: [number, number];
  onSaveMarkerPosition?: (position: [number, number]) => void;
}

export const AddressFormMap = ({
  adjustablePosition,
  markerPosition,
  onSaveMarkerPosition,
  onMove,
  ...mapProps
}: AddressFormMapProps) => {
  const [hasAdjusted, setHasAdjusted] = useState(false);
  const originalPositionRef = useRef<[number, number] | undefined>(markerPosition);
  const lastSavedRef = useRef<[number, number] | undefined>(undefined);

  if (
    markerPosition &&
    !isSamePosition(originalPositionRef.current, markerPosition) &&
    !isSamePosition(lastSavedRef.current, markerPosition)
  ) {
    originalPositionRef.current = markerPosition;
    lastSavedRef.current = undefined;
    setHasAdjusted(false);
  } else if (
    hasAdjusted &&
    markerPosition &&
    isSamePosition(originalPositionRef.current, markerPosition) &&
    !isSamePosition(lastSavedRef.current, markerPosition)
  ) {
    lastSavedRef.current = undefined;
    setHasAdjusted(false);
  }

  const isMovedAway = (lng: number, lat: number) => {
    const orig = originalPositionRef.current;
    if (!orig) return false;
    return Math.abs(lng - orig[0]) > 0.0001 || Math.abs(lat - orig[1]) > 0.0001;
  };

  const handleMove = (evt: { viewState: { longitude: number; latitude: number; zoom: number } }) => {
    onMove?.(evt as Parameters<NonNullable<typeof onMove>>[0]);

    if (!originalPositionRef.current || !markerPosition || !adjustablePosition) return;

    setHasAdjusted(isMovedAway(evt.viewState.longitude, evt.viewState.latitude));
  };

  const handleMoveEnd = (evt: { viewState: { longitude: number; latitude: number; zoom: number } }) => {
    if (!originalPositionRef.current || !markerPosition || !adjustablePosition) return;

    const position: [number, number] = isMovedAway(evt.viewState.longitude, evt.viewState.latitude)
      ? [evt.viewState.longitude, evt.viewState.latitude]
      : originalPositionRef.current;

    lastSavedRef.current = position;
    onSaveMarkerPosition?.(position);
  };

  const handleReset = () => {
    const orig = originalPositionRef.current;
    if (orig) {
      setHasAdjusted(false);
      onSaveMarkerPosition?.(orig);
      onMove?.({
        viewState: { longitude: orig[0], latitude: orig[1], zoom: mapProps.zoom ?? 10 },
      } as Parameters<NonNullable<typeof onMove>>[0]);
    }
  };

  return (
    <Map {...mapProps} onMove={handleMove} onMoveEnd={handleMoveEnd}>
      {markerPosition && (
        <MapMarker
          adjustablePosition={adjustablePosition}
          markerPosition={originalPositionRef.current}
          hasAdjustedPosition={hasAdjusted}
          onReset={handleReset}
          colorScheme={getColorScheme(mapProps.mapStyle)}
        />
      )}
    </Map>
  );
};
