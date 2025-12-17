import type { MovieDetail } from "@/interfaces/MovieDetail";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

interface PopularListProps {
  isOpen: boolean;
  movies: MovieDetail[];
  listName: string;
  onClose: () => void;
  handleImport: () => void;
}

export const PopularListView = ({ movies, listName, onClose, handleImport }: PopularListProps) => {

  return (
    <div className="fixed inset-0 z-50">
      <div className="flex items-center justify-center min-h-screen bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in">
        <div className="flex flex-col bg-stone-900 text-white p-8 rounded-lg shadow-lg w-full max-w-lg mx-auto scale-95">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">{listName}</h2>
          </div>

          <div className="flex flex-col gap-2 max-h-[560px] overflow-y-auto pr-1">
            {movies.map((movie) => (
              <div
                key={movie.id}
                className="flex items-center gap-3 p-2 rounded bg-stone-800"
              >
                <img
                  src={movie.poster}
                  alt={movie.titulo}
                  className="w-20 h-28 object-cover rounded"
                />
                <div className="text-left text-lg">
                  <Link
                    to={`/movie/${movie.imdb_id}`}
                    className="font-medium text-white hover:underline transition"
                  >
                    {movie.titulo}
                  </Link>
                  <p className="text-stone-400">{movie.ano}</p>
                </div>
              </div>
            ))}
          </div>
          <Button
            className="bg-green-600 text-lg hover:bg-green-700 mt-4"
            onClick={() => { handleImport() }}
          >
            Import
          </Button>
          <Button
            className="bg-blue-600 text-lg hover:bg-blue-700 mt-4 -mb-4"
            onClick={() => { onClose() }}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

