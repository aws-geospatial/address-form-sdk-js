import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProvider } from "../../test/utils";
import { MapProps } from "../Map";
import { TypeaheadProps } from "../Typeahead";
import { AddressForm, AddressFormData, AddressFormProps, defaultAddressFormFields } from "./index";

vi.mock("../Map", () => ({
  Map: ({ children }: MapProps) => <div data-testid="map">{children}</div>,
}));

vi.mock("../MapMarker", () => ({
  MapMarker: () => <div data-testid="map-marker"></div>,
}));

vi.mock("../Typeahead", () => ({
  Typeahead: ({ id, onSelect, placeholder }: TypeaheadProps) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      onSelect({ addressLineOneField: value });
    };

    return <input data-testid={id} id={id} placeholder={placeholder} onChange={handleChange} />;
  },
}));

describe("AddressForm", () => {
  const mockProps = {
    fields: defaultAddressFormFields,
    onSubmit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with default props", () => {
    renderWithProvider(<AddressForm typeahead={{ source: "autocomplete" }} {...mockProps} />);
    expect(screen.getByTestId("aws-address-line-one")).toBeInTheDocument();
    expect(screen.getByTestId("aws-address-line-two")).toBeInTheDocument();
    expect(screen.getByTestId("aws-city")).toBeInTheDocument();
    expect(screen.getByTestId("aws-province")).toBeInTheDocument();
    expect(screen.getByTestId("aws-postal-code")).toBeInTheDocument();
    expect(screen.getByLabelText("Country")).toBeInTheDocument();
    expect(screen.getByTestId("map")).toBeInTheDocument();
    expect(screen.getByTestId("map-marker")).toBeInTheDocument();
  });

  it("renders with configured props", () => {
    const configuredProps: AddressFormProps = {
      ...mockProps,
      fields: [
        {
          id: "aws-address-line-one",
          name: "addressLineOne",
          label: "Configured Address Line One",
          placeholder: "Configured Address Line One",
        },
        {
          id: "aws-country",
          name: "country",
          label: "Configured Country",
          placeholder: "Configured Country",
        },
      ],
      typeahead: { source: null },
      map: { hide: true },
    };
    renderWithProvider(<AddressForm {...configuredProps} />);
    expect(screen.getByTestId("aws-address-line-one")).toBeInTheDocument();
    expect(screen.queryByTestId("aws-address-line-two")).not.toBeInTheDocument();
    expect(screen.queryByTestId("aws-city")).not.toBeInTheDocument();
    expect(screen.queryByTestId("aws-province")).not.toBeInTheDocument();
    expect(screen.queryByTestId("aws-postal-code")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Country")).toBeInTheDocument();
    expect(screen.queryByTestId("map")).not.toBeInTheDocument();
    expect(screen.queryByTestId("map-marker")).not.toBeInTheDocument();
  });

  it("submits form data when submit button is clicked", async () => {
    const { container } = renderWithProvider(<AddressForm typeahead={{ source: "autocomplete" }} {...mockProps} />);
    const form = container.querySelector("form")!;
    fireEvent.submit(form);
    expect(mockProps.onSubmit).toHaveBeenCalledTimes(1);
    expect(mockProps.onSubmit).toHaveBeenCalledWith({
      addressLineOne: "",
      addressLineTwo: "",
      adjustedPosition: "",
      city: "",
      country: "",
      originalPosition: "",
      postalCode: "",
      province: "",
    });
  });

  it("renders the address form and submits with correct values", async () => {
    const { container } = renderWithProvider(<AddressForm typeahead={{ source: "autocomplete" }} {...mockProps} />);
    const form = container.querySelector("form")!;

    const inputValues: AddressFormData = {
      addressLineOne: "510 W Georgia St",
      addressLineTwo: "Suite 14",
      city: "Vancouver",
      postalCode: "V6B 1Z6",
      country: "Canada",
      province: "BC",
      originalPosition: "",
      adjustedPosition: "",
    };

    // Fill in all the fields
    await userEvent.type(screen.getByLabelText("Address"), inputValues.addressLineOne ?? "");
    await userEvent.type(screen.getByLabelText("Address Line 2"), inputValues.addressLineTwo ?? "");
    await userEvent.type(screen.getByLabelText("City"), inputValues.city ?? "");
    await userEvent.type(screen.getByLabelText("Province/State"), inputValues.province ?? "");
    await userEvent.type(screen.getByLabelText("Postal/Zip code"), inputValues.postalCode ?? "");
    // Handle country combobox - type to open dropdown and select first option
    await userEvent.type(screen.getByLabelText("Country"), inputValues.country ?? "");
    // Wait for dropdown options to appear and select the first one
    const firstOption = await screen.findByRole("option", { name: /canada/i });
    await userEvent.click(firstOption);

    // Confirm that the text was entered correctly
    expect(screen.getByLabelText("Address")).toHaveValue(inputValues.addressLineOne);
    expect(screen.getByLabelText("Address Line 2")).toHaveValue(inputValues.addressLineTwo);
    expect(screen.getByLabelText("City")).toHaveValue(inputValues.city);
    expect(screen.getByLabelText("Province/State")).toHaveValue(inputValues.province);
    expect(screen.getByLabelText("Postal/Zip code")).toHaveValue(inputValues.postalCode);
    expect(screen.getByLabelText("Country")).toHaveValue(inputValues.country);

    fireEvent.submit(form);

    // Verify that onSubmit was called with the correct values
    expect(mockProps.onSubmit).toHaveBeenCalledTimes(1);
    expect(mockProps.onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        addressLineOne: "510 W Georgia St",
        addressLineTwo: "Suite 14",
        city: "Vancouver",
        postalCode: "V6B 1Z6",
        country: "CA",
        province: "BC",
        adjustedPosition: "",
      }),
    );
  });
});
