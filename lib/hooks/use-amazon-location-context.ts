import { useContext } from "react";
import AmazonLocationContext from "../context/amazon-location-context";

function useAmazonLocationContext() {
  const context = useContext(AmazonLocationContext);

  if (!context) {
    throw new Error("Please wrap this component with <AmazonLocationProvider> component.");
  }

  return context;
}

export default useAmazonLocationContext;
