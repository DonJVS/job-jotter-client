import { useState } from "react";

function useLocalStorage(key, initialValue = null) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        // Attempt to parse the item
        return JSON.parse(item);
      } else {
        // If no item exists, use the initial value
        return initialValue;
      }
    } catch (err) {
      console.error(`Error reading localStorage key "${key}":`, err);
      // Reset to initial value if parsing fails
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      if (value === null) {
        // Remove key if value is set to null
        window.localStorage.removeItem(key);
      } else {
        // Store value as a stringified JSON
        window.localStorage.setItem(key, JSON.stringify(value));
      }
      setStoredValue(value);
    } catch (err) {
      console.error(`Error writing localStorage key "${key}":`, err);
    }
  };

  return [storedValue, setValue];
}

export default useLocalStorage;
