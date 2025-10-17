import "maplibre-gl/dist/maplibre-gl.css";
import { Container, createRoot } from "react-dom/client";
import { AddressForm, AddressFormProps } from "./components/AddressForm";
import { AmazonLocationProvider } from "./components/AmazonLocationProvider";

interface AddressForm extends AddressFormProps {
  root: Container;
  apiKey: string;
  region: string;
}

export const addressForm = ({ root, apiKey, region, ...addressFormProps }: AddressForm) => {
  createRoot(root).render(
    <AmazonLocationProvider apiKey={apiKey} region={region}>
      <AddressForm {...addressFormProps} />
    </AmazonLocationProvider>,
  );
};
