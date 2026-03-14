import useDebounce from "../hooks/use-debounce";
import { useFetchPhotos, type Photo } from "../hooks/use-fetch-photos";
import { useCallback, useEffect, useState, useMemo, useReducer } from "react";

const INITIAL_PAGE = 1;

type FavouriteAction =
  | { type: "INIT_FAVOURITES"; payload: string[] }
  | { type: "TOGGLE_FAVOURITE"; payload: string };

const favouritesReducer = (
  state: Set<string>,
  action: FavouriteAction,
): Set<string> => {
  switch (action.type) {
    case "INIT_FAVOURITES":
      return new Set(action.payload);
    case "TOGGLE_FAVOURITE": {
      const newState = new Set(state);
      if (newState.has(action.payload)) {
        newState.delete(action.payload);
      } else {
        newState.add(action.payload);
      }
      return newState;
    }
    default:
      return state;
  }
};

const Gallery = () => {
  const [page, setPage] = useState(INITIAL_PAGE);
  const [favPhotos, dispatchFav] = useReducer(
    favouritesReducer,
    new Set<string>(),
  );

  const [allPhotos, setAllPhotos] = useState<Photo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavourites, setShowFavourites] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { data, loading, error, cancelFetch, retryFetch } = useFetchPhotos({
    page,
  });

  // Accumulate photos and prevent duplicates (solves Strict Mode issue)
  useEffect(() => {
    setAllPhotos((prev) => [...prev, ...data]);
  }, [data]);

  useEffect(() => {
    const storedFavPhotos = localStorage.getItem("favPhotos");
    if (storedFavPhotos) {
      try {
        dispatchFav({
          type: "INIT_FAVOURITES",
          payload: JSON.parse(storedFavPhotos),
        });
      } catch (error) {
        console.error("Error parsing favPhotos from localStorage", error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("favPhotos", JSON.stringify(Array.from(favPhotos)));
  }, [favPhotos]);

  // Optimization: use useCallback to prevent re-creating this function on every render,
  // which is especially important since it's passed to child components mapped from the array.
  const handleFav = useCallback((id: string) => {
    dispatchFav({ type: "TOGGLE_FAVOURITE", payload: id });
  }, []);

  // Optimization: use useMemo to avoid recalculating the filtered array on every render
  // unless the data, searchQuery, or showFavourites change.
  const filteredData = useMemo(() => {
    return allPhotos.filter((photo) => {
      const matchesSearch = photo.author
        .toLowerCase()
        .includes(debouncedSearchQuery.toLowerCase());
      const matchesFavourites = showFavourites ? favPhotos.has(photo.id) : true;
      return matchesSearch && matchesFavourites;
    });
  }, [allPhotos, debouncedSearchQuery, showFavourites, favPhotos]);

  return (
    <div className="space-y-6 mb-10">
      <div className="flex gap-4 flex-wrap items-center">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          type="search"
          size={30}
          placeholder="Search for photos..."
          className="p-2 border border-border rounded-xl focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-ring"
        />
        <label className="flex items-center gap-2 cursor-pointer bg-secondary px-4 py-2 rounded-xl">
          <input
            type="checkbox"
            checked={showFavourites}
            onChange={(e) => setShowFavourites(e.target.checked)}
            className="w-4 h-4 rounded text-primary focus:ring-primary"
          />
          <span className="text-sm font-medium">Show Favourites Only</span>
        </label>
      </div>
      <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">
        {filteredData.map(({ author, id }) => (
          <div
            key={id}
            className="relative hover:scale-105 transition-transform drop-shadow-lg"
          >
            <img
              loading="lazy"
              decoding="async"
              width={400}
              height={400}
              src={`https://picsum.photos/id/${id}/500/500`}
              srcSet={`https://picsum.photos/id/${id}/400/400 400w, https://picsum.photos/id/${id}/800/800 800w, https://picsum.photos/id/${id}/1200/1200 1200w`}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
              alt={author}
              className="object-cover rounded-lg"
            />

            <div className="absolute left-2 top-2">
              <span className="bg-primary px-2 py-1 rounded-full text-primary-foreground text-sm">
                {author}
              </span>
            </div>

            <div className="absolute bottom-2 right-2">
              <button
                onClick={() => handleFav(id)}
                className={`bg-secondary px-2 py-1 rounded-full cursor-pointer text-sm text-secondary-foreground`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke={favPhotos.has(id) ? "red" : "currentColor"}
                  fill={favPhotos.has(id) ? "red" : "none"}
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredData.length === 0 && (
        <div className="text-red-500 text-center">
          {searchQuery.length > 0
            ? "No search results found"
            : showFavourites
              ? "No photos found in favourites"
              : "No photos found"}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-4 items-center justify-center my-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <button
            onClick={() => cancelFetch()}
            className="bg-primary text-primary-foreground px-6 py-4 rounded mx-auto mb-10 block"
          >
            cancel
          </button>
        </div>
      ) : error ? (
        <div className="flex flex-col gap-4 items-center justify-center my-4">
          <div className="text-red-500">
            Error: {error instanceof Error ? error.message : "Unknown error"}
          </div>
          <button
            onClick={() => retryFetch()}
            className="bg-primary text-primary-foreground px-6 py-4 rounded mx-auto mb-10 block"
          >
            retry
          </button>
        </div>
      ) : (
        filteredData.length > 0 &&
        !showFavourites &&
        searchQuery.length === 0 && (
          <button
            onClick={() => setPage(page + 1)}
            className="bg-primary text-primary-foreground px-6 py-4 rounded mx-auto mb-10 block"
          >
            load more
          </button>
        )
      )}
    </div>
  );
};

export default Gallery;
