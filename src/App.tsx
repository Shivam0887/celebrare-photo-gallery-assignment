import Gallery from "./components/gallery";
import Navbar from "./components/navbar";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 flex flex-col px-4 max-w-7xl mx-auto w-full">
        <div className="py-10">
          <h1 className="text-2xl font-bold text-center">
            Find your next favorite photo
          </h1>
          <p className="text-center text-muted-foreground">
            Browse our collection of high-quality photos and find your next
            favorite photo.
          </p>
        </div>
        <div className="flex-1 flex flex-col">
          <Gallery />
        </div>
      </main>
    </div>
  );
}

export default App;
