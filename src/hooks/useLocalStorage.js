import { useState } from "react";

function useLocalStorage(key, initialValue = null) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (err) {
      console.error("Error reading from localStorage:", err);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      if (value === null) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
      setStoredValue(value);
    } catch (err) {
      console.error("Error writing to localStorage:", err);
    }
  };

  return [storedValue, setValue];
}

export default useLocalStorage;