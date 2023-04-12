import { useState, useEffect, useCallback, useRef } from "react";

const useHttpClient = () => {
  const [isLoading, setIsLoading] = useState(null);
  const [error, setError] = useState(null);

  const activeHttpRequests = useRef([]); // creates a constant which persists re-renders

  const sendRequest = useCallback(
    async (url, method = "GET", headers = {}, body = null) => {
      setIsLoading(true);
      // A controller object which allows us to abort one or more DOM requests
      const httpAbortCtrl = new AbortController();
      activeHttpRequests.current.push(httpAbortCtrl);

      try {
        const response = await fetch(url, {
          method,
          headers,
          body,
          signal: httpAbortCtrl.signal, // this binds the AbortSignal with request
        });

        const responseData = await response.json();

        activeHttpRequests.current = activeHttpRequests.current.filter(
          (abortCtrl) => abortCtrl !== httpAbortCtrl
        );
        if (!response.ok) {
          throw new Error(responseData.message);
        }

        setIsLoading(false);
        return responseData;
      } catch (err) {
        // Used to ignore fetch abort error, one gets aborted every time
        if (err.name !== "AbortError") {
          setError(
            err.message || "An unexpected error occurred. Please try again."
          );

          setIsLoading(false);
          throw err;
        }
      }
    },
    []
  );

  useEffect(() => {
    return () => {
      // Cleanup function calling AbortSignal for each request
      activeHttpRequests.current.forEach((abortCtrl) => abortCtrl.abort());
    };
  }, []);

  const clearError = () => setError(null);

  return { isLoading, error, sendRequest, clearError };
};

export default useHttpClient;
