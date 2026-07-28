import { fireEvent, waitFor } from "@testing-library/dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./detect-autofill.css.ts", () => ({
  form: "mock-form-class",
  animation: "mock-animation-name",
}));

import { detectAutofill } from "./detect-autofill";

// Create AnimationEvent for test environment
class MockAnimationEvent extends Event {
  animationName: string;

  constructor(type: string, options: { animationName: string }) {
    super(type);
    this.animationName = options.animationName;
  }
}

describe("detectAutofill", () => {
  let form: HTMLFormElement;
  let addressInput: HTMLInputElement;
  let cityInput: HTMLInputElement;
  let callback: ReturnType<typeof vi.fn<() => void>>;

  beforeEach(() => {
    callback = vi.fn();

    // Create real DOM elements
    form = document.createElement("form");

    // Address input
    addressInput = document.createElement("input");
    addressInput.name = "addressLineOne";
    addressInput.value = "";
    form.appendChild(addressInput);

    // City input
    cityInput = document.createElement("input");
    cityInput.name = "city";
    cityInput.value = "";
    form.appendChild(cityInput);

    // Mock only the specific methods we need to control
    vi.spyOn(form, "querySelectorAll").mockReturnValue([addressInput] as unknown as NodeListOf<Element>);
  });

  it("should attach event listeners to form and add CSS class", () => {
    const addEventListenerSpy = vi.spyOn(form, "addEventListener");
    const classListAddSpy = vi.spyOn(form.classList, "add");

    detectAutofill(form, callback);

    expect(classListAddSpy).toHaveBeenCalledWith("mock-form-class");
    expect(addEventListenerSpy).toHaveBeenCalledWith("animationstart", expect.any(Function));
  });

  it("should return cleanup function that removes event listeners and CSS class", () => {
    const removeEventListenerSpy = vi.spyOn(form, "removeEventListener");
    const classListRemoveSpy = vi.spyOn(form.classList, "remove");

    const cleanup = detectAutofill(form, callback);
    cleanup();

    expect(classListRemoveSpy).toHaveBeenCalledWith("mock-form-class");
    expect(removeEventListenerSpy).toHaveBeenCalledWith("animationstart", expect.any(Function));
  });

  it("should attach input listeners when autofill animation starts", () => {
    const inputAddEventListenerSpy = vi.spyOn(addressInput, "addEventListener");

    detectAutofill(form, callback);

    // Trigger animation start event
    form.dispatchEvent(new MockAnimationEvent("animationstart", { animationName: "mock-animation-name" }));

    expect(inputAddEventListenerSpy).toHaveBeenCalledWith("input", expect.any(Function));
  });

  it("should call callback when autofill field changes", async () => {
    detectAutofill(form, callback);

    // Trigger animation start
    form.dispatchEvent(new MockAnimationEvent("animationstart", { animationName: "mock-animation-name" }));

    // Trigger input event
    fireEvent.input(addressInput, { target: { value: "123 Main St" } });
    fireEvent.input(cityInput, { target: { value: "Cityville" } });

    await waitFor(() => {
      expect(callback).toHaveBeenCalledWith({ addressLineOne: "123 Main St", city: "Cityville" });
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  it("should not attach listeners for wrong animation name", () => {
    const inputAddEventListenerSpy = vi.spyOn(addressInput, "addEventListener");

    detectAutofill(form, callback);

    // Trigger animation start with wrong name
    form.dispatchEvent(new MockAnimationEvent("animationstart", { animationName: "wrong-animation" }));

    expect(inputAddEventListenerSpy).not.toHaveBeenCalled();
  });
});
