# Celebrare Photo Gallery

A responsive, high-performance photo gallery web application built with React, TypeScript, and Vite, consuming the Picsum Photos API.

## Features

- **Infinite Scrolling / Pagination**: Click "Load More" to fetch additional photos from the API. New photos append seamlessly to the grid.
- **Search by Author**: Live search filtering dynamically updates the grid to only show photos by authors matching the query.
- **Favourites & Persistence**: Toggle heart icons to favourite photos. Favourites are persisted in `localStorage` so they remain across page reloads.
- **Filter Favourites**: Toggle "Show Favourites Only" to instantly filter the view to your hand-picked selection.
- **Fully Responsive**: Grid adapts cleanly to all devices (desktop: 4 columns, tablet: 2 columns, mobile: 1 column).
- **Graceful Error Handling**: Loading states, empty states ("No photos found"), and robust API error recovery logic.

## Technical Optimizations

This project implements specific architectural optimizations to ensure peak performance:

- **State Management**: Complex boolean states (Favourites) are managed predictably using `useReducer` as opposed to scattered `useState` hooks.
- **`useCallback` Caching**: Event handlers passed down to mapped child elements (`handleFav`) and effect dependencies (`cancelFetch`) are wrapped in `useCallback` to maintain referential equality across renders, preventing needless child component reconciliation.
- **`useMemo` Derived State**: Filtering logic runs inside a `useMemo` block. This prevents the anti-pattern of maintaining duplicate state variables via `useEffect`. Filtering only runs when the underlying data, search query, or filter toggle explicitly change.
- **Image Performance**:
  - Automatically fetches downsized thumbnails from the API instead of multi-megabyte source images.
  - Implements `srcSet` and `sizes` attributes (`w` descriptors) to serve appropriately sized images to high-density (Retina) mobile screens and large desktop monitors dynamically.
  - Uses `loading="lazy"` to defer offscreen image loading.
  - Uses `decoding="async"` to prevent image decoding from blocking the main thread.

## Quick Start

### Prerequisites

Make sure you have Node installed, and use `pnpm` for package management.

### Installation

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

### Running Locally

Start the Vite development server:

```bash
pnpm dev
```

Open your browser to `http://localhost:5173`.

### Building for Production

Compile TypeScript and build the static assets:

```bash
pnpm build
```

To preview the production build locally:

```bash
pnpm preview
```

## Tech Stack

- **Framework**: React 19
- **Tooling**: Vite, TypeScript
- **Styling**: Tailwind CSS
- **Linting**: ESLint
