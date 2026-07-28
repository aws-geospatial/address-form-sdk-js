import { describe, expect, it, vi } from "vitest";
import { useEffect } from "react";
import { render } from "@testing-library/react";
import { AddressFormProvider } from "./AddressFormProvider";
import { useAddressFormContext } from "./AddressFormContext";
import type { CenterBounds } from "../../utils/bounds";

vi.mock("../../utils/api", () => ({ initializeAwsSdkClient: vi.fn() }));

const bounds: CenterBounds = [
  [103.6, 1.2],
  [104.1, 1.5],
];

// Probe that surfaces the derived flag, seeds an adjustedPosition (the only input that can
// flip the flag), and reports every time an effect keyed on the whole context object fires —
// mirrors AddressFormAddressField's `[..., context]` effect, which is what runs away if the
// context identity churns.
const Probe = ({ onContext, adjustedPosition }: { onContext: () => void; adjustedPosition?: string }) => {
  const context = useAddressFormContext();
  const { setData } = context;
  useEffect(() => {
    if (adjustedPosition) setData({ adjustedPosition });
    // Seed once on mount. setData's identity churns as data changes, so keying on it would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    onContext();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally keyed only on context identity
  }, [context]);
  return <div data-testid="oob">{String(context.isAdjustedPositionOutOfBounds ?? false)}</div>;
};

describe("AddressFormProvider centerBounds", () => {
  it("reports isAdjustedPositionOutOfBounds=false when no bounds are given", () => {
    const { getByTestId } = render(
      <AddressFormProvider apiKey="test-key" region="ap-southeast-1" initialMapCenter={[0, 0]}>
        <Probe onContext={() => {}} adjustedPosition="120,20" />
      </AddressFormProvider>,
    );
    expect(getByTestId("oob").textContent).toBe("false");
  });

  it("reports isAdjustedPositionOutOfBounds=false when there is no adjusted pin", () => {
    const { getByTestId } = render(
      <AddressFormProvider apiKey="test-key" region="ap-southeast-1" initialMapCenter={[120, 20]} centerBounds={bounds}>
        <Probe onContext={() => {}} />
      </AddressFormProvider>,
    );
    // The center is outside the box, but nothing has been adjusted, so submit is not blocked.
    expect(getByTestId("oob").textContent).toBe("false");
  });

  it("reports isAdjustedPositionOutOfBounds=false when the adjusted pin is inside bounds", () => {
    const { getByTestId } = render(
      <AddressFormProvider
        apiKey="test-key"
        region="ap-southeast-1"
        initialMapCenter={[103.85, 1.35]}
        centerBounds={bounds}
      >
        <Probe onContext={() => {}} adjustedPosition="103.9,1.4" />
      </AddressFormProvider>,
    );
    expect(getByTestId("oob").textContent).toBe("false");
  });

  it("reports isAdjustedPositionOutOfBounds=true when the adjusted pin is outside bounds", () => {
    const { getByTestId } = render(
      <AddressFormProvider
        apiKey="test-key"
        region="ap-southeast-1"
        initialMapCenter={[103.85, 1.35]}
        centerBounds={bounds}
      >
        <Probe onContext={() => {}} adjustedPosition="120,20" />
      </AddressFormProvider>,
    );
    expect(getByTestId("oob").textContent).toBe("true");
  });

  it("does not churn context identity when re-rendered with a new array of the same bounds", () => {
    const onContext = vi.fn();
    const { rerender } = render(
      <AddressFormProvider
        apiKey="test-key"
        region="ap-southeast-1"
        initialMapCenter={[103.85, 1.35]}
        centerBounds={[
          [103.6, 1.2],
          [104.1, 1.5],
        ]}
      >
        <Probe onContext={onContext} />
      </AddressFormProvider>,
    );

    expect(onContext).toHaveBeenCalledTimes(1);

    // A fresh array literal with identical values (what an inline prop produces each render)
    // must not rebuild the context object, or the context-dependent effect would re-fire.
    rerender(
      <AddressFormProvider
        apiKey="test-key"
        region="ap-southeast-1"
        initialMapCenter={[103.85, 1.35]}
        centerBounds={[
          [103.6, 1.2],
          [104.1, 1.5],
        ]}
      >
        <Probe onContext={onContext} />
      </AddressFormProvider>,
    );

    expect(onContext).toHaveBeenCalledTimes(1);
  });
});
