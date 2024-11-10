import { useEffect, useState } from 'react';

/**
 * Hook để debounce một giá trị.
 * 
 * @param value - Giá trị cần debounce.
 * @param delay - Thời gian debounce (ms).
 * @returns - Giá trị đã debounce.
 */
const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function để hủy bỏ timeout nếu giá trị thay đổi
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
