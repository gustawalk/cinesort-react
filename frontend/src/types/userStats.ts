export interface UserStats {
  lastMovie: string,
  watchedMovies: number,
  highestRated: string,
  lowestRated: string
}

export interface UserList {
  id: number,
  id_user_dono: number,
  nome_lista: string,
  uuid: string
}

export interface MovieList {
  id: number,
  id_lista_origem: number,
  movie_imdb_id: string
}
