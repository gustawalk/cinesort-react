import { useNavigate } from "react-router-dom";

export const MovieLink = ({ movie }: { movie?: { name_movie: string; id_movie: string } }) => {
  const navigate = useNavigate();

  if (!movie || !movie.id_movie || movie.id_movie === "") {
    return <span className="text-blue-400">{movie?.name_movie}</span>;
  }

  const truncate = (text: string, max: number): string => {
    if (text.length < max) return text;
    const str = text.slice(0, max) + "..."
    return str;
  }

  return (
    <span
      className="text-blue-400 hover:text-blue-600 cursor-pointer"
      onClick={() => navigate(`/movie/${movie.id_movie}`)}
    >
      {truncate(movie.name_movie, 20)}
    </span>
  );
};
