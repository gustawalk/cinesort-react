import axios from "axios";
import * as cheerio from 'cheerio';
import { MovieSearchInfo } from "@/models/moviesearchinfo.model";
import { pool } from "@/config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { Movie } from "@/models/movie.model";
import { SearchTemplate } from "@/models/searchtemplate.model";

export const get_info_from_tmdb = async (id_filme: string): Promise<MovieSearchInfo> => {
  try {
    const url = `https://www.themoviedb.org/movie/${id_filme}`;
    const { data: html } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });

    const $ = cheerio.load(html);

    const titulo = $('div.title a').first().text().trim() || "Error fetching title";

    const ano = $('span.release_date')
      .first()
      .text()
      .trim()
      .match(/\d{4}/)?.[0] || "Error fetching year";

    const duracao = $('span.runtime').text().trim() || "Error fetching duration";

    const sinopse = $('div.overview p').first().text().trim() || "Error fetching synopsis";

    const poster = $('div.image_content img.poster').attr('src')
      ? `${$('div.image_content img.poster').attr('src')}`
      : "https://upload.wikimedia.org/wikipedia/commons/archive/c/c2/20170513175702%21No_image_poster.png";


    let score = $('div.user_score_chart').attr('data-percent') || "N/A";

    if (score != "N/A" && score.length == 2) { score = `${score[0]}.${score[1]}` }
    if (score != "N/A" && score.length == 1) { score = `0.${score[0]}` }

    let diretor = "Error fetching director";
    $('ol.people li.profile').each((_, el) => {
      const role = $(el).find('.character').text().toLowerCase();
      if (role.includes("director")) {
        diretor = $(el).find('a').first().text().trim();
        return;
      }
    });

    return {
      titulo,
      ano,
      duracao,
      sinopse,
      poster,
      diretor,
      imdb_id: id_filme,
      imdb_rate: score
    } as MovieSearchInfo;
  } catch (err) {
    throw err;
  }
}

export const search_movie_on_db = async (id_filme: string): Promise<Movie> => {
  try {
    const [result] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM filmes WHERE imdb_id = ?", [id_filme]
    );

    if (result.length < 1) {
      console.log("Movie not found, searching and inserting on db")
      const movie = await get_info_from_tmdb(id_filme);
      const [result] = await pool.query<ResultSetHeader>(
        "INSERT INTO filmes (titulo, sinopse, ano, duracao, diretor, poster, imdb_id, imdb_rate) VALUES (?, ?, ?, ? ,? ,? ,?, ?)",
        [movie.titulo, movie.sinopse, movie.ano, movie.duracao, movie.diretor, movie.poster, movie.imdb_id, movie.imdb_rate]
      )

      const [rows] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM filmes WHERE id = ?", [result.insertId]
      )

      console.log(rows[0])
      return rows[0] as Movie;
    }
    console.log("movie found")
    console.log(result[0] as Movie)

    return result[0] as Movie;
  } catch (err) {
    throw err
  }
}

export const search_movie_on_tmdb = async (movie_name: string): Promise<SearchTemplate[]> => {
  try {
    const url = `https://www.themoviedb.org/search/movie?query=${encodeURIComponent(movie_name)}`;
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        "Accept-Language": "en-US,en;q=0.9"
      }
    });

    const $ = cheerio.load(html);
    const resultados: SearchTemplate[] = []

    $('.card.v4.tight').each((_, el) => {
      const container = $(el);

      const title = container.find('h2').first().text().trim();
      const link = container.find('a.result').first().attr('href');
      const mediaType = container.find('a.result').attr('data-media-type');
      const releaseDateRaw = container.find('.release_date').first().text().trim();
      const year = releaseDateRaw.match(/\d{4}/)?.[0];
      const image = container.find('.poster.w-full').attr('src') || "https://upload.wikimedia.org/wikipedia/commons/archive/c/c2/20170513175702%21No_image_poster.png";

      if (!title || !link || !year) return

      if (mediaType == "movie") {
        resultados.push({
          title,
          year,
          link,
          image
        })
      }
    })

    return resultados;
  } catch (err) {
    return [];
  }
}
