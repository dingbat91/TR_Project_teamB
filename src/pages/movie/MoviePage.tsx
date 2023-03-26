import React, { useContext, useEffect, useState } from "react";
import { APIFetch } from "../../scripts/fetch/fetch";
import "./MoviePage.css";
import {
  Credits,
  MovieDetails,
  movieTrailerDetails,
  movieTrailerResult,
} from "../../types/movie";
import { useParams } from "react-router-dom";
import AddToWatchlist from "../../components/button/addToWatchlist";
import { UpdateWatchlistContext, WatchlistContext } from "../../layout/layout";

export const MoviePage: React.FC = () => {
  const [moviedata, setMovieData] = useState<MovieDetails>();
  const { movieID } = useParams();
  const [movieTrailerData, setmovieTrailerData] =
    useState<movieTrailerResult[]>();
  const [credits, setCredits] = useState<Credits>();

  useEffect(() => {
    const datafetch = async () => {
      const data = await APIFetch(`/movie/${movieID}`);
      setMovieData(data);

      const trailerdata: movieTrailerDetails = await APIFetch(
        `/movie/${movieID}/videos`
      );
      if (trailerdata.results) {
        setmovieTrailerData(trailerdata.results);
      }

      const creditsdata: Credits = await APIFetch(`/movie/${movieID}/credits`);
      if (creditsdata) {
        setCredits(creditsdata);
      }
    };
    datafetch();
  }, [movieID]);

  const watchlistContext = useContext(WatchlistContext);
  const watchlistUpdateContext = useContext(UpdateWatchlistContext);

  const handleWatchListClick = () => {
    if (moviedata) {
      const isWatchlisted =
        watchlistContext.length > 0 &&
        watchlistContext.some((movie) => movie.id === moviedata.id);
      if (!isWatchlisted) {
        watchlistUpdateContext([...watchlistContext, moviedata]);
      } else {
        const filteredWatchlistMovies = watchlistContext.filter(
          (movie) => movie.id !== moviedata.id
        );
        watchlistUpdateContext(filteredWatchlistMovies);
      }
    }
  };

  return (
    <main className="moviePage">
      <div>
        <h1 className="moviePage__title">{moviedata?.original_title}</h1>
        <AddToWatchlist
          onClickHandler={handleWatchListClick}
          isAdded={
            moviedata
              ? watchlistContext.some((movie) => movie.id === moviedata.id)
              : false
          }
        />
      </div>
      <article className="moviePage__details">
        <img
          alt={`Poster ${moviedata?.original_title}`}
          className="moviePage__details__img"
          src={`https://image.tmdb.org/t/p/original${moviedata?.poster_path}`}
        />
        <article className="moviePage__details__infoBox">
          <p className="infoBox__tagline">{moviedata?.tagline}</p>
          <h2 className="infoBox__overviewTitle">Overview:</h2>
          <p className="infoBox__Overview">{moviedata?.overview}</p>
          <h2 className="infoBox__detailsTitle">Details</h2>
          <article className="infoBox__detailsBox">
            <div className="detailsBox__Col1">
              <h3 className="detailsBox__releaseStatus__title">Status</h3>
              <p className="detailsBox__releaseStatus">{moviedata?.status}</p>
              <h3 className="detailsBox__genre__Title">Genre</h3>
              <p className="detailsBox__genre">
                {moviedata?.genres.map((genre) => genre.name).join(", ")}
              </p>
            </div>
            <div className="detailsBox__Col2">
              <h3 className="detailsBox__budget__title">Budget</h3>
              <p className="detailsBox__budget">
                {moviedata?.budget.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </p>
              <h3 className="detailsBox__revenue__title">Revenue</h3>
              <p className="detailsBox__revenue">
                {moviedata?.revenue?.toLocaleString("en-US", {
                  style: "currency",
                  currency: "usd",
                })}
              </p>
            </div>
          </article>
        </article>
      </article>
      <h1 className="moviePage__Cast__title">Top Cast</h1>
      <article className="moviePage__Cast">
        {/*If credits is defined: Create a card for first ten members*/}
        {!credits && <p>Loading...</p>}
        {credits &&
          credits.cast &&
          credits.cast.slice(0, 10).map(
            (cast) =>
              cast.profile_path && (
                <article className="moviePage__Cast__card">
                  <img
                    className="moviePage__Cast__card__img"
                    src={`https://image.tmdb.org/t/p/original${cast.profile_path}`}
                    alt={cast.name}
                  />
                  <p className="moviePage__Cast__card__name">{cast.name}</p>
                  <p className="moviePage__Cast__card__character">
                    {`"${cast.character}"`}
                  </p>
                </article>
              )
          )}
      </article>

      <article className="moviePage__Trailer">
        {movieTrailerData && movieTrailerData.length >= 1 && (
          <h1 className="moviePage__Trailer__title">Trailers</h1>
        )}
        {movieTrailerData?.slice(0, 5).map((trailer) => (
          <iframe
            className="moviePage__Trailer__video"
            src={`https://www.youtube.com/embed/${trailer.key}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={trailer.name}
            loading="lazy"
          ></iframe>
        ))}
      </article>
    </main>
  );
};
