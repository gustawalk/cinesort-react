import { useState, useEffect, useRef } from "react";
import Swal from 'sweetalert2';
import type { MovieInfo } from "@/interfaces/MovieInfo";

interface MovieModalProps {
  movie: MovieInfo;
  isOpen: boolean;
  onClose: () => void;
  onMovieRated?: () => void;
}

export const MovieModal = ({ movie, isOpen, onClose, onMovieRated }: MovieModalProps) => {
  const [rating, setRating] = useState<number>(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const displayRate = movie.imdb_rate || "??";

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  const handleRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length > 1 && value[0] === "0") {
      value = value.slice(1);
    }

    let intValue = parseInt(value || "0");
    intValue = Math.min(100, Math.max(0, intValue));
    setRating(intValue);
  };

  const openStremio = () => {
    window.open(`stremio://${encodeURIComponent(`${movie.titulo} ${movie.ano}`)}`, '_blank');
  };

  const handleSetAsWatched = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You can only change your rate by watching it again",
      icon: "question",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#d33",
      background: "#1c1917",
      color: "#ffffff",
      showCancelButton: true,
      confirmButtonText: "Yes, rate it!",
      cancelButtonText: "No, not yet!"
    });

    if (result.isConfirmed) {
      try {
        // TODO: real handling the rate, sending info to backend
        console.log("Rating with: ", rating)
        onMovieRated?.();
        onClose();
      } catch (error) {
        console.error("Error rating movie:", error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="flex items-center justify-center min-h-screen bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in">
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="movie-title"
          tabIndex={-1}
          className="flex flex-col items-center text-center bg-stone-900 text-white p-8 pl-8 pr-8 rounded-lg shadow-lg w-full max-w-sm mx-auto scale-95">
          <div className="flex items-center justify-center mb-4 gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="30" viewBox="0 0 80 30">
              <rect width="80" height="30" fill="#F5C518" rx="8" ry="8" />
              <text
                x="50%"
                y="50%"
                text-anchor="middle"
                dominant-baseline="middle"
                dy=".1em"
                font-family="Arial, sans-serif"
                font-size="16"
                fill="black"
                font-weight="bold">
                TMDB
              </text>
            </svg>
            <svg className="w-6 h-6 text-yellow-500" xmlns="http://www.w3.org/2000/svg"
              width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495
                             2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067
                             2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436
                             2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z"/>
              <title>TMDB Rating</title>
            </svg>
            <span className="text-lg font-bold text-white">{displayRate} / 10</span>
          </div>

          <h2 id="movie-title" className="text-xl font-bold">{movie.titulo} - {movie.ano}</h2>
          <h4 className="text-sm text-gray-300">{movie.duracao}</h4>
          <img src={movie.poster} alt={`${movie.titulo} poster`} className="w-full h-80 2xl:h-auto rounded-lg mt-3" />

          <label htmlFor="rating" className="mt-4">Rate this movie</label>
          <div className="flex items-center justify-center gap-2 mt-1">
            <input
              id="rating"
              type="number"
              min="0"
              max="100"
              value={(rating / 10).toFixed(1)}
              onChange={handleRatingChange}
              className="w-20 text-white text-center font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none px-2 py-1 rounded-md"
            />
            <span className="font-semibold text-white">/ 10.0</span>
          </div>

          <button onClick={openStremio} className="mt-2 p-2 px-5 bg-blue-600 text-white hover:bg-blue-800 transition text-lg rounded-lg">
            Watch in Stremio
          </button>

          <button onClick={handleSetAsWatched} className="mt-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-lg transition">
            Set as watched
          </button>
          <p className='text-gray-300 mt-2'>(You don't have choice)</p>
        </div>
      </div>
    </div>
  );
};

