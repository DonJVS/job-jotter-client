import { render, act } from "@testing-library/react";
import useLocalStorage from "./useLocalStorage";

describe("useLocalStorage", () => {
  let result;

  // Helper component to test the hook
  const TestComponent = ({ storageKey, initialValue }) => {
    result = useLocalStorage(storageKey, initialValue);
    return null;
  };

  beforeEach(() => {
    localStorage.clear();
  });

  test("should return default value when no value exists in localStorage", () => {
    render(<TestComponent storageKey="test-key" initialValue="default" />);

    const [storedValue] = result;
    expect(storedValue).toBe("default");
  });

  test("should return stored value when key exists in localStorage", () => {
    localStorage.setItem("test-key", JSON.stringify("stored-value"));

    render(<TestComponent storageKey="test-key" initialValue="default" />);

    const [storedValue] = result;
    expect(storedValue).toBe("stored-value");
  });

  test("should update localStorage when state changes", () => {
    render(<TestComponent storageKey="test-key" initialValue="default" />);

    const [, setStoredValue] = result;

    act(() => {
      setStoredValue("new-value");
    });

    expect(localStorage.getItem("test-key")).toBe(JSON.stringify("new-value"));
    const [storedValue] = result;
    expect(storedValue).toBe("new-value");
  });

  test("should handle non-string initial values correctly", () => {
    render(<TestComponent storageKey="test-key" initialValue={{ a: 1, b: 2 }} />);

    const [storedValue, setStoredValue] = result;
    expect(storedValue).toEqual({ a: 1, b: 2 });

    act(() => {
      setStoredValue({ a: 3 });
    });

    expect(localStorage.getItem("test-key")).toBe(JSON.stringify({ a: 3 }));
  });

  test("should remove the item when setting it to null", () => {
    render(<TestComponent storageKey="test-key" initialValue="default" />);

    const [, setStoredValue] = result;

    act(() => {
      setStoredValue(null);
    });

    expect(localStorage.getItem("test-key")).toBeNull();
    const [storedValue] = result;
    expect(storedValue).toBeNull();
  });
});
