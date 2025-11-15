export interface UserStats {
  lastMovie: {
    name_movie: string;
    id_movie: string;
  },
  watchedMovies: number,
  highestRated: {
    name_movie: string;
    id_movie: string;
  },
  lowestRated: {
    name_movie: string;
    id_movie: string;
  },
}
