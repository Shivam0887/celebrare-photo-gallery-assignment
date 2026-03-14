import { useCallback, useEffect, useRef, useState } from "react";

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

type UseFetchPhotos = {
  data: Photo[];
  loading: boolean;
  error: unknown | null;
  cancelFetch: () => void;
  retryFetch: () => void;
};

export const useFetchPhotos = ({ page = 1 }: Props): UseFetchPhotos => {
  const [data, setData] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchPhotos = useCallback(async () => {
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://picsum.photos/v2/list?limit=30&page=${page}`,
        { signal: abortControllerRef.current.signal },
      );
      const newPhotos = await response.json();
      setData((prev) => [...prev, ...newPhotos]);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Fetch aborted");
        return;
      }
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const cancelFetch = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  return { data, loading, error, cancelFetch, retryFetch: fetchPhotos };
};
