import { ComponentProps, FunctionComponent } from "react";
import { Button } from "../Button";
import { useAddressFormContext } from "./AddressFormContext";

// Submit button that reads the shared context so it disables itself while the adjusted pin is
// outside the supported region. Used by both the composable React path (AddressFormFields) and
// the standalone data-attribute path (render.tsx), so the two stay in sync. A consumer-supplied
// `disabled` still wins when it is explicitly set.
export const SubmitButton: FunctionComponent<ComponentProps<"button">> = ({ disabled, ...props }) => {
  const { isAdjustedPositionOutOfBounds } = useAddressFormContext();
  return <Button {...props} type="submit" disabled={disabled ?? isAdjustedPositionOutOfBounds ?? false} />;
};
