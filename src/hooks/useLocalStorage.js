import { useState } from "react";

function useLocalStorage(key, initialValue = null) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      console.log(`Reading from localStorage: ${key} = ${item}`); // Debugging
      return item ? JSON.parse(item) : initialValue;
    } catch (err) {
      console.error("Error reading from localStorage:", err);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      if (value === null) {
        console.log(`Removing from localStorage: ${key}`); // Debugging
        window.localStorage.removeItem(key);
      } else {
        console.log(`Writing to localStorage: ${key} = ${JSON.stringify(value)}`); // Debugging
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