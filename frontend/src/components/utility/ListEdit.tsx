import type { ListEditModel } from "@/interfaces/ListEditModel";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

interface ListEditProps {
  isOpen: boolean;
  listName: string;
  movies: ListEditModel[];
  handleDelete: (movie_id: string) => void;
  onClose: () => void;
}

export const ListEdit = ({ listName, movies, onClose, handleDelete }: ListEditProps) => {

  const handleConfirmDelete = async (id_movie: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You can't revert this action",
      icon: "question",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#d33",
      background: "#1c1917",
      color: "#ffffff",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No"
    });

    if (result.isConfirmed) {
      try {
        handleDelete(id_movie);
      } catch (error) {
        console.error("Error rating movie:", error);
      }
    }

  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="flex items-center justify-center min-h-screen bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in">
        <div className="flex flex-col bg-stone-900 text-white p-8 rounded-lg shadow-lg w-full max-w-lg mx-auto scale-95">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold"> Editing {listName} </h2>
            <span className="text-sm text-stone-400"> Movies: {movies.length}</span>
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
                  className="w-10 h-14 object-cover rounded"
                />
                <div className="text-left">
                  <Link
                    to={`/movie/${movie.imdb_id}`}
                    className="font-medium"
                  >
                    {movie.titulo}
                  </Link>
                  <p className="text-sm text-stone-400">{movie.ano}</p>
                </div>
                <button
                  className="ml-auto font-semibold text-red-500 hover:text-red-800 transition pr-2"
                  title="Remove from list"
                  onClick={() => { handleConfirmDelete(movie.imdb_id) }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 mt-4"
            onClick={() => { onClose() }}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

