import { useCallback, useEffect, useReducer, useRef } from "react";

export interface Photo {
  id: string;
  author: string;
  url: string;
  download_url: string;
  height: number;
  width: number;
}

interface Props {
  page?: number;
}

interface State {
  data: Photo[];
  loading: boolean;
  error: unknown | null;
}

interface FetchActions {
  cancelFetch: () => void;
  retryFetch: () => void;
}

type Action =
  | { type: "SET_PHOTOS"; payload: Photo[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: unknown | null };

const API_URL = "https://picsum.photos/v2/list?limit=30";

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "SET_PHOTOS":
      return { ...state, data: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

export const useFetchPhotos = ({ page = 1 }: Props): State & FetchActions => {
  const [state, dispatch] = useReducer(reducer, {
    data: [],
    loading: false,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchPhotos = useCallback(async () => {
    abortControllerRef.current = new AbortController();

    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });
    try {
      const response = await fetch(`${API_URL}&page=${page}`, {
        signal: abortControllerRef.current.signal,
      });
      const newPhotos = await response.json();
      dispatch({ type: "SET_PHOTOS", payload: newPhotos });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Fetch aborted");
        return;
      }
      dispatch({ type: "SET_ERROR", payload: error });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [page]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const cancelFetch = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  return { ...state, cancelFetch, retryFetch: fetchPhotos };
};
