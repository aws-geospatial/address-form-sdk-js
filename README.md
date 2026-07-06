## Amazon Location Address Form SDK

The Address Form SDK simplifies the development of autofill address forms. As users type their addresses, the form displays relevant suggestions. Selecting a suggestion populates the subsequent fields, including street, city, state, and postal code. This intelligent feature reduces errors and saves time by eliminating manual typing. Users can preview the selected address on a map and adjust the location pin.

## Getting Started

The Address Form SDK can be used within a React app or in a standalone HTML and JavaScript page. Get started by following the instructions below or use the step by step wizard from our console to configure the address form.

### Prerequisites

You will need an API key with permission to call the actions listed below. Follow [this guide for how to create an API key](https://docs.aws.amazon.com/location/latest/developerguide/using-apikeys.html).

The use of the Address Form will require the following actions to be allowed by your API key:

| Action           | Purpose                                                     | Required When                                          |
| ---------------- | ----------------------------------------------------------- | ------------------------------------------------------ |
| `GetTile`        | Retrieves map tiles for rendering the interactive map       | Displaying a map component                             |
| `Autocomplete`   | Provides real-time address suggestions as users type        | Using the Autocomplete API for typeahead functionality |
| `Suggest`        | Provides real-time address suggestions as users type        | Using the Suggest API for typeahead functionality      |
| `ReverseGeocode` | Converts coordinates to address                             | Allowing users to use their current location           |
| `GetPlace`       | Retrieves detailed place information for selected addresses | Using the typeahead functionality                      |

### Installation

#### React

Install the SDK in your React app by running: `npm install @aws/address-form-sdk-js`

#### HTML/JavaScript

Include the following in your HTML code the CSS and JavaScript for the SDK

```html
...
<head>
  ...
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/@aws/address-form-sdk-js/dist/standalone/address-form-sdk.css"
  />
  ...
</head>
...
<body>
  ...
  <script src="https://cdn.jsdelivr.net/npm/@aws/address-form-sdk-js/dist/standalone/address-form-sdk.umd.js"></script>
</body>
...
```

### Use SDK

Implement the following code into your React app. Replace the `AMAZON_LOCATION_API_KEY` value with your API key and `AMAZON_LOCATION_REGION` with the region of the API key.

#### React

```jsx
import React from "react";
import { AddressForm, Flex } from "@aws/address-form-sdk-js";

export default function App() {
  return (
    <AddressForm
      apiKey="AMAZON_LOCATION_API_KEY"
      region="AMAZON_LOCATION_REGION"
      onSubmit={async (getData) => {
        // Get form data with intendedUse parameter
        // Use "SingleUse" for one-time display only
        // Use "Storage" if you plan to store/cache the results - makes an extra API call to grant storage rights
        const data = await getData({ intendedUse: "SingleUse" });
        console.log(data);
      }}
    >
      <Flex direction="row" flex>
        <Flex direction="column">
          <input
            data-api-name="autocomplete"
            data-type="address-form"
            name="addressLineOne"
            placeholder="Enter address"
          />
          <input data-type="address-form" name="addressLineTwo" />
          <input data-type="address-form" name="city" placeholder="City" />
          <input data-type="address-form" name="province" placeholder="State/Province" />
          <input data-type="address-form" name="postalCode" />
          <input data-type="address-form" name="country" placeholder="Country" />
          <Flex direction="row">
            <button data-type="address-form" type="submit">
              Submit
            </button>
            <button data-type="address-form" type="reset">
              Reset
            </button>
          </Flex>
        </Flex>
        <AddressForm.Map mapStyle={["Standard", "Light"]} />
      </Flex>
    </AddressForm>
  );
}
```

#### HTML/JavaScript

```html
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Address Form</title>
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@aws/address-form-sdk-js/dist/standalone/address-form-sdk.css"
    />
  </head>
  <body>
    <form id="amazon-location-address-form" class="aws-address-form aws-flex-row aws-flex-1">
      <div class="aws-flex-column">
        <input
          data-type="address-form"
          name="addressLineOne"
          data-api-name="suggest"
          data-show-current-location="true"
        />
        <input data-type="address-form" name="addressLineTwo" />
        <input data-type="address-form" name="city" />
        <input data-type="address-form" name="province" />
        <input data-type="address-form" name="postalCode" />
        <input data-type="address-form" name="country" />
        <div class="aws-flex-row">
          <button data-type="address-form" type="submit">Submit</button>
          <button data-type="address-form" type="reset">Reset</button>
        </div>
      </div>
      <div data-type="address-form" data-map-style="Standard,Light"></div>
    </form>
    <script src="https://cdn.jsdelivr.net/npm/@aws/address-form-sdk-js/dist/standalone/address-form-sdk.umd.js"></script>
    <script>
      AddressFormSDK.render({
        root: "#amazon-location-address-form",
        apiKey: "AMAZON_LOCATION_API_KEY",
        region: "AMAZON_LOCATION_REGION",
        showCurrentCountryResultsOnly: true,
        onSubmit: async (getData) => {
          // Get form data with intendedUse parameter
          // Use "SingleUse" for one-time display only
          // Use "Storage" if you plan to store/cache the results - makes an extra API call to grant storage rights
          const data = await getData({ intendedUse: "SingleUse" });
          console.log(data);
        },
      });
    </script>
  </body>
</html>
```

### Customization

The form is fully customizable - add, remove, or rearrange elements as needed for your use case. Replace the `Flex` component with your own CSS framework or custom styling. You can control other functionalities of the address form through the component props/attributes. See the [API Reference](#api-reference) for complete customization options.

### Supported Countries

The Address Form SDK supports address autofill worldwide through Amazon Location Service. The following countries have full support with address field parsing, where each address component is populated into its respective field:

- Australia
- Canada
- France
- Hong Kong
- Ireland
- New Zealand
- Philippines
- Singapore
- United Kingdom
- United States

Other countries are in Preview, where the `addressLineOne` field displays the complete address instead of just the street address portion. Future releases will improve this behavior.

## API Reference

### AddressForm

**React:** The main component that wraps the address form functionality. `<AddressForm>`

**HTML/JavaScript:** The function used for rendering the address form onto the page `AddressForm.render({ ... })`

#### Props

| Property                        | Type                            | Required | Default | Description                                                                                                                                                                                                                                  |
| ------------------------------- | ------------------------------- | -------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apiKey`                        | `string`                        | Yes      | -       | The Amazon Location Service API key used to authenticate requests.                                                                                                                                                                           |
| `region`                        | `string`                        | Yes      | -       | The AWS region where Amazon Location Service is called (e.g., "us-east-1")                                                                                                                                                                   |
| `language`                      | `string`                        | No       | -       | [Language code](https://en.wikipedia.org/wiki/IETF_language_tag#List_of_common_primary_language_subtags) for localized address suggestions (e.g., "en", "es")                                                                                |
| `politicalView`                 | `string`                        | No       | -       | Political view for address results, affecting disputed territories display                                                                                                                                                                   |
| `showCurrentCountryResultsOnly` | `boolean`                       | No       | `false` | Limits autofill suggestions to the country selected in the `Country` field                                                                                                                                                                   |
| `allowedCountries`              | `string[]`                      | No       | -       | Array of ISO country codes (alpha-2 or alpha-3) to restrict address suggestions. See [countries.ts](lib/data/countries.ts) for alpha-2 reference                                                                                             |
| `placeTypes`                    | `AutocompleteFilterPlaceType[]` | No       | -       | Array of [place types](https://docs.aws.amazon.com/location/latest/APIReference/API_geoplaces_AutocompleteFilter.html#location-Type-geoplaces_AutocompleteFilter-IncludePlaceTypes) to filter results (e.g., "Locality", "PostalCode")       |
| `initialMapCenter`              | `[number, number]`              | No       | -       | Initial map center as [longitude, latitude] coordinates. If not provided and a single country is specified in `allowedCountries`, the map centers on that country's capital                                                                  |
| `initialMapZoom`                | `number`                        | No       | Varies  | Initial map zoom level. Defaults: 10 when `initialMapCenter` is provided, 5 when centering on a single allowed country, 1 otherwise                                                                                                          |
| `onSubmit`                      | `(getData) => void`             | No       | -       | Callback function that receives a `getData` async function for retrieving [form data](https://github.com/aws-geospatial/address-form-sdk-js/blob/30fd74fcad353249ad54cc69c4bc5dd39fda7680/README.md?plain=1#L219) with intendedUse parameter |

#### Form Submission Data

When the form is submitted, the `onSubmit` callback receives a `getData` async function. Call this function with an `intendedUse` parameter to retrieve the form data:

```javascript
onSubmit: async (getData) => {
  const data = await getData({
    intendedUse: "SingleUse", // or "Storage"
  });
};
```

**Important:** Use `"Storage"` if you plan to store or cache the results. This ensures compliance with Amazon Location Service [intended use requirements](https://docs.aws.amazon.com/location/latest/developerguide/places-intended-use.html).

The returned data object contains the following properties:

| Property           | Type      | Description                                                                                                    |
| ------------------ | --------- | -------------------------------------------------------------------------------------------------------------- |
| `placeId`          | `string`  | Place ID from Amazon Location Service (only present when address was selected from typeahead or locate button) |
| `addressLineOne`   | `string`  | Primary address line (street address)                                                                          |
| `addressLineTwo`   | `string`  | Secondary address line (apartment, suite, etc.)                                                                |
| `city`             | `string`  | City name                                                                                                      |
| `province`         | `string`  | State or province                                                                                              |
| `postalCode`       | `string`  | Postal or ZIP code                                                                                             |
| `country`          | `string`  | Country code (ISO 3166-1 alpha-2)                                                                              |
| `originalPosition` | `string`  | Original coordinates from API response (longitude,latitude)                                                    |
| `adjustedPosition` | `string`  | User-adjusted coordinates if map pin was moved (longitude,latitude)                                            |
| `addressDetails`   | `Address` | Complete address object from Amazon Location Service API (GetPlace/ReverseGeocode response)                    |

**Note:** The `addressDetails` property contains the full API response from Amazon Location Service and is only present when the address was populated through our APIs (typeahead selection or locate button). Addresses entered manually by users will not contain this property.

### Form Input Fields

All input fields use the `data-type="address-form"` attribute along with a `name=` attribute. The following common properties are supported:

#### Common Input Properties

| Property      | Type     | Required | Description                        |
| ------------- | -------- | -------- | ---------------------------------- |
| `label`       | `string` | No       | Custom label for the input field   |
| `placeholder` | `string` | No       | Placeholder text for the input     |
| `className`   | `string` | No       | CSS class names for custom styling |

#### Address Line One (`name="addressLineOne"`)

Primary address input with autofill functionality. See [Supported Countries](#supported-countries) for information about address field parsing behavior in different countries.

| Property                     | Type     | Default         | Description                                                                                                                                            |
| ---------------------------- | -------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `label`                      | `string` | "Address"       | Label for the field                                                                                                                                    |
| `placeholder`                | `string` | "Enter address" | Placeholder text                                                                                                                                       |
| `data-api-name`              | `string` | "suggest"       | API type: `autocomplete` or `suggest`. Use `suggest` to return both POI and address suggestions, and `autocomplete` to return address-only suggestions |
| `data-show-current-location` | `string` | "true"          | Enables current location functionality using the browser’s Geolocation API. This will prompt the user for permission to access their location          |

#### Other Input Fields

- **Address Line Two** (`name="addressLineTwo"`): Default label "Address Line 2", placeholder "Apartment, suite, etc."
- **City** (`name="city"`): Default label "City"
- **Province/State** (`name="province"`): Default label "Province/State"
- **Postal Code** (`name="postalCode"`): Default label "Postal/Zip code"
- **Country** (`name="country"`): Default label "Country"

### Form Buttons

#### Submit Button

```html
<button data-type="address-form" type="submit">Submit</button>
```

#### Reset Button

```html
<button data-type="address-form" type="reset">Reset</button>
```

### AddressForm.Map

Map component for displaying and adjusting address location.

**React:** Map component for displaying and adjusting address location. `<AddressForm.Map mapStyle={...}>`

**HTML/JavaScript:** Map element for displaying and adjusting address location.`<div data-type="address-form" data-map-style="...">`

#### Props

| React Property          | React Type | HTML/JavaScript Attribute      | HTML/JavaScript Type | Required | Default | Description                            |
| ----------------------- | ---------- | ------------------------------ | -------------------- | -------- | ------- | -------------------------------------- |
| `mapStyle`              | `array`    | `data-map-style`               | `string`             | Yes      | -       | Map style configuration                |
| `showNavigationControl` | `boolean`  | `data-show-navigation-control` | `string`             | No       | `true`  | Display map navigation controls        |
| `adjustablePosition`    | `boolean`  | `data-adjustable-position`     | `string`             | No       | `true`  | Allow users to adjust address position |

#### Map Style Options

Map styles consist of two parts: the **map style name** and the **color scheme**. The map style name determines the visual theme (Standard, Monochrome, Hybrid, or Satellite), while the color scheme specifies the brightness variant (Light or Dark) where applicable.

| React Implementation (Array Format) | HTML/JavaScript Implementation (String Format) |
| ----------------------------------- | ---------------------------------------------- |
| `['Standard', 'Light']`             | `"Standard,Light"`                             |
| `['Standard', 'Dark']`              | `"Standard,Dark"`                              |
| `['Monochrome', 'Light']`           | `"Monochrome,Light"`                           |
| `['Monochrome', 'Dark']`            | `"Monochrome,Dark"`                            |
| `['Hybrid']`                        | `"Hybrid"`                                     |
| `['Satellite']`                     | `"Satellite"`                                  |

For detailed descriptions of each map style and color scheme, see [AWS map styles and customization](https://docs.aws.amazon.com/location/latest/developerguide/map-styles.html).

## Contributing

We welcome community contributions and pull requests. See [CONTRIBUTING](CONTRIBUTING.md) for information on how to set up a development environment, and submit code.

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This project is licensed under the Apache-2.0 License.
