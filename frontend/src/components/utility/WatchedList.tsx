import { Link } from "react-router-dom";
import { Button } from "../ui/button"
import type { WatchedMovies } from "@/interfaces/WatchedMovies"
import { useMemo, useState } from "react";

interface WatchedMoviesProps {
  isOpen: boolean;
  watched_list: WatchedMovies[];
  onClose: () => void;
}

export default function WatchedList({ watched_list, onClose }: WatchedMoviesProps) {

  const [orderBy, setOrderBy] = useState<"name" | "score" | "watched">("score");
  const [search, setSearch] = useState("")

  const filteredAndSortedList = useMemo(() => {
    return [...watched_list]
      .filter(movie =>
        movie.name_movie
          .toLowerCase()
          .includes(search.toLowerCase())
      )
      .sort((a, b) => {
        switch (orderBy) {
          case "score":
            return Number(b.score_movie) - Number(a.score_movie);
          case "watched":
            return b.times_watched - a.times_watched;
          case "name":
          default:
            return a.name_movie.localeCompare(b.name_movie);
        }
      });
  }, [watched_list, orderBy, search]);

  return (
    <div className="fixed inset-0 z-50">
      <div className="flex items-center justify-center min-h-screen bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in">
        <div className="flex flex-col bg-stone-900 text-white p-8 rounded-lg shadow-lg w-full max-w-lg mx-auto scale-95">
          <div className="mb-4 flex items-center justify-between">
          </div>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-lg font-semibold">Watched List</span>

            <select
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value as any)}
              className="bg-stone-800 text-white text-sm rounded px-2 py-1 border border-stone-700 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
            >
              <option value="name">Name</option>
              <option value="score">Rating</option>
              <option value="watched">Watched count</option>
            </select>
          </div>
          <div>

            <input
              type="text"
              placeholder="Search for movie name"
              onChange={(e) => setSearch(e.target.value)}
              className="
                mb-3 w-full
                rounded-md
                bg-stone-800
                text-white text-sm
                px-3 py-2
                border border-stone-700
                placeholder:text-stone-400
                focus:outline-none
                focus:ring-1 focus:ring-blue-500
                focus:border-blue-500
                transition
              "
            />
          </div>
          <div className="flex flex-col gap-2 max-h-[560px] overflow-y-auto pr-1">
            {filteredAndSortedList.map((movie) => (
              <div
                key={movie.id}
                className="flex items-center justify-between p-3 rounded-lg bg-stone-800 hover:bg-stone-700 transition"

              >
                {/* Left: Movie name */}
                <Link
                  to={`/movie/${movie.id_movie}`}
                  className="text-lg font-semibold text-white hover:underline"
                >
                  {movie.name_movie}
                </Link>

                {/* Right: stats */}
                <div className="flex flex-col items-end leading-tight">
                  {/* Times watched */}
                  <div className="flex items-center gap-1 text-white">
                    <svg
                      className="w-5 h-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 12c0 1.2-4.03 6-9 6s-9-4.8-9-6c0-1.2 4.03-6 9-6s9 4.8 9 6Z" />
                      <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                    <span className="font-medium">{movie.times_watched}</span>
                  </div>

                  {/* User score */}
                  <span className="text-sm text-stone-400">
                    {Number(movie.score_movie) / 10} / 10
                  </span>
                </div>
              </div>
            ))}
          </div>

          <Button
            className="bg-blue-600 hover:bg-blue-700 mt-4"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
