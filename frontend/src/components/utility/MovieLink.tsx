import { useNavigate } from "react-router-dom";

export const MovieLink = ({ movie }: { movie?: { name_movie: string; id_movie: string } }) => {
  const navigate = useNavigate();
  console.log("Movie data:", movie);

  if (!movie || !movie.id_movie || movie.id_movie === "") {
    return <span className="text-blue-400">{movie?.name_movie}</span>;
  }

  return (
    <span
      className="text-blue-400 hover:text-blue-600 cursor-pointer"
      onClick={() => navigate(`/movie/${movie.id_movie}`)}
    >
      {movie.name_movie}
    </span>
  );
};
