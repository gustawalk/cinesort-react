import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { decodeJwt } from 'jose'
import { useCallback, useEffect, useState } from "react";
import { MovieLink } from "@/components/utility/MovieLink";
import { MovieModal } from "@/components/utility/MovieModal";
import type { MovieInfo } from "@/interfaces/MovieInfo";
import type { GetUserListsOptions } from "@/interfaces/GetUserListsOptions";
import Swal from 'sweetalert2';
import showToast from "@/components/ui/toast";
import { ListEdit } from "@/components/utility/ListEdit";
import type { ListEditModel } from "@/interfaces/ListEditModel";

export interface UserStats {
  lastMovie: {
    name_movie: string;
    id_movie: string;
  },
  watchedMovies: number | null,
  highestRated: {
    name_movie: string;
    id_movie: string;
  },
  lowestRated: {
    name_movie: string;
    id_movie: string;
  },
}

interface MovieSearchResult {
  title: string;
  year: string;
  link: string;
  image: string;
}

interface UserLists {
  id: number,
  nome_lista: string
}


const LoadingSpinner = () => (
  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
);

const SkeletonCard = () => (
  <Card className="bg-stone-800 border-stone-700 rounded-xl shadow-lg animate-pulse">
    <CardHeader>
      <div className="h-6 bg-stone-700 rounded w-32"></div>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="h-10 bg-stone-700 rounded"></div>
        <div className="h-10 bg-stone-700 rounded"></div>
        <div className="h-10 bg-stone-700 rounded"></div>
      </div>
    </CardContent>
  </Card>
);


export default function HomeView() {
  const navigate = useNavigate();
  const [_user, setUser] = useState<any>(null)
  const [userLists, setUserLists] = useState<UserLists[]>([])
  const [selectedList, setSelectedList] = useState<number | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isListEditOpen, setIsListEditOpen] = useState<boolean>(false);
  const [editListMovies, setEditListMovies] = useState<ListEditModel[] | null>(null)
  const [selectedMovie, setSelectedMovie] = useState<MovieInfo | null>(null)
  const [searchValue, setSearchValue] = useState<string>("");
  const [searchResult, setSearchResult] = useState<MovieSearchResult[]>([])
  const [isLoadingSearch, setIsLoadingSearch] = useState<boolean>(false);
  const [imagesLoaded, setImagesLoaded] = useState<boolean>(false);

  const getUserFromToken = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const decoded = decodeJwt(token);
      return decoded;
    } catch (err) {
      console.error('Invalid token: ', err)
      return null;
    }
  }, [])

  const truncate = (text: string, max: number): string => {
    if (text.length < max) return text
    const str = text.slice(0, max) + "..."
    return str;
  }

  const selectedListData = userLists.find(
    (list) => list.id === selectedList
  );

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login")
      return;
    }

    const userData = getUserFromToken();
    if (!userData) {
      localStorage.removeItem("token")
      navigate("/login")
      return
    }

    setUser(userData);
    return token;
  }, [navigate, getUserFromToken])

  const getUserStats = useCallback(async () => {
    try {
      const token = checkAuth()

      const response = await fetch("/api/user/stats", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();
      const dataUserStats = data.user_stats;

      setUserStats(dataUserStats);
    } catch (err) {
      throw err;
    }
  }, [checkAuth, navigate])

  const checkUserPendency = async () => {
    try {
      const token = checkAuth()
      if (!token) return;

      const response = await fetch("/api/user/pendency", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.status != 200) {
        const data = await response.json();
        setSelectedMovie(data.movie);
        setIsModalOpen(true);
      }

    } catch (err) {
      throw err;
    }
  }

  const getUserLists = useCallback(async ({ selectLastList = false }: GetUserListsOptions = {}) => {
    try {
      const token = checkAuth()
      if (!token) return;

      const response = await fetch("/api/list", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        navigate('/login')
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        return
      }

      const lists = data.user_lists.map((l: any) => ({
        id: l.id,
        nome_lista: truncate(l.nome_lista, 20)
      }))

      if (lists.length === 0) {
        setUserLists([{
          id: -1,
          nome_lista: 'No Lists found'
        }]);
        setSelectedList(-1);
      } else {
        setUserLists(lists);
        if (selectLastList) {
          setSelectedList(lists[lists.length - 1].id);
        } else {
          setSelectedList(lists[0].id);
        }
      }

    } catch (err) {
      localStorage.removeItem("token");
      navigate("/login")
      throw err;
    }
  }, [navigate, checkAuth])

  const handleMovieClick = (link: string) => {
    localStorage.setItem('movieSearch', JSON.stringify({
      searchValue,
      searchResult,
      imagesLoaded,
      timestamp: Date.now()
    }));

    navigate(link);
  };

  const handleDeleteFromEdit = async (movie_id: string) => {
    const token = checkAuth();
    if (!token) return;

    const response = await fetch("/api/list/movie/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ listId: selectedList, movieId: movie_id })
    })

    if (response.status === 200) {
      setEditListMovies(prev =>
        prev ? prev.filter(m => m.imdb_id !== movie_id) : prev
      );
      showToast("success", "Deleted successfully")
      return;
    }

    showToast("warning", "Something went wrong")
  }

  const handleSearch = async () => {
    if (searchValue.trim() == "") return;
    const token = checkAuth();
    if (!token) return;

    setImagesLoaded(false);
    setIsLoadingSearch(true)
    setSearchResult([])

    const response = await fetch(`/api/movie/search/${searchValue}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await response.json();
    const results: MovieSearchResult[] = data.result || [];

    await preloadImages(results);

    setSearchResult(results)
    setImagesLoaded(true)
    setIsLoadingSearch(false)
  }

  const preloadImages = (movies: MovieSearchResult[]) => {
    return Promise.all(
      movies.map(movie => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.src = movie.image;
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      })
    );
  };

  const handleCreate = async () => {
    const { value: newListName } = await Swal.fire({
      title: "Create a new list",
      input: "text",
      inputPlaceholder: "Enter your list name",
      showCancelButton: true,
      confirmButtonText: "Create",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#d33",
      background: "#1c1917",
      color: "#ffffff",
      inputAttributes: {
        maxlength: "50",
        autocapitalize: "off",
        autocorrect: "off"
      }
    });

    if (newListName === undefined) return;
    if (newListName.trim('') === '') return;
    const token = checkAuth();
    if (!token) return;

    const response = await fetch("/api/list", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ listName: newListName })
    });

    if (response.status == 409) {
      Swal.fire({
        title: "This list already exists",
        text: "Try using a different name!",
        icon: "error",
        background: "#1c1917",
        color: "#ffffff",
        iconColor: "#ef4444",
        confirmButtonText: "Ok",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    getUserLists({ selectLastList: true });
  }

  const handleEdit = async () => {
    const token = checkAuth();
    if (!token) return;

    const response = await fetch(`/api/list/${selectedList}/edit`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    })

    const data = await response.json();
    console.log(data)
    setEditListMovies(data.movies)
    setIsListEditOpen(true)
  }

  const handleDraw = async () => {
    const token = checkAuth();
    if (!token) return;
    const response = await fetch(`/api/list/${selectedList}/draw`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (response.status == 204) {
      Swal.fire({
        title: "You dont have any movies in this list",
        text: "Try adding some movie first!",
        icon: "warning",
        color: "#ffffff",
        iconColor: "#c7950c",
        background: "#1c1917",
      })
      return;
    }
    if (response.status == 200) {
      const data = await response.json();
      setSelectedMovie(data.movie);
      setIsModalOpen(true);
    }
  }

  const handleDelete = async () => {

    const token = checkAuth();
    if (!token) return;

    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this",
      icon: "warning",
      color: "#ffffff",
      iconColor: "#c7950c",
      showCancelButton: true,
      background: "#1c1917",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#d33"
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await fetch("/api/list", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ listId: selectedList })
        })

        if (response.status === 200) {
          getUserLists();
          showToast("success", "List deleted")
        }
      }
    })
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedMovie(null)
  }

  const handleListEditClose = () => {
    setIsListEditOpen(false);
  }

  const handleMovieRated = async (rating: string) => {
    const token = checkAuth();
    if (!token) return;

    const response = await fetch("/api/movie/rate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        movie: selectedMovie,
        rate: rating
      })
    });

    if (response.status === 200) {
      getUserStats();
      showToast("success", "Movie rated")
    }
  }

  const handleRandom = () => {
    // TODO: handle random movie query
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate("/login")
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([getUserLists(), getUserStats(), checkUserPendency()]);

        const saved = localStorage.getItem('movieSearch');
        if (saved) {
          const { searchValue: savedValue, searchResult: savedResults, timestamp } = JSON.parse(saved);

          if (Date.now() - timestamp < 10 * 60 * 1000) {
            setSearchValue(savedValue);
            setSearchResult(savedResults);
            setImagesLoaded(true);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [getUserLists, getUserStats]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-900 text-white font-sans flex flex-col">
        <div className="p-4">
          <div className="h-10 w-24 bg-stone-700 rounded animate-pulse"></div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row justify-center items-start lg:items-center gap-6 px-4 py-8 lg:py-0">
          <Card className="bg-stone-800 border-stone-700 rounded-xl shadow-lg w-full max-w-lg animate-pulse">
            <CardHeader>
              <div className="h-6 bg-stone-700 rounded w-48 mx-auto"></div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 h-10 bg-stone-700 rounded"></div>
                <div className="flex gap-2">
                  <div className="h-10 w-24 bg-stone-700 rounded"></div>
                  <div className="h-10 w-24 bg-stone-700 rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6 w-full max-w-lg lg:max-w-96">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>

        <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-stone-800 rounded-lg p-6 shadow-2xl flex flex-col items-center gap-4">
            <LoadingSpinner />
            <p className="text-white text-lg font-semibold">Loading your data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-900 text-white font-sans flex flex-col">
      {/* Logout button */}
      <div className="p-4">
        <Button
          variant="secondary"
          className="bg-stone-700 text-white hover:bg-stone-600"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:flex-row justify-center items-start lg:items-center gap-6 px-4 py-8 lg:py-0">
        {/* Center search card */}
        <Card className="bg-stone-800 border-stone-700 rounded-xl shadow-lg w-full max-w-lg text-center order-1">
          <CardHeader>
            <h2 className="text-white text-xl font-semibold">Search for a Movie</h2>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Enter movie name"
                className="flex-1 px-3 py-2 rounded-lg bg-stone-700 text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <div className="flex gap-2">
                <Button className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none"
                  onClick={handleSearch}
                >
                  Search
                </Button>
                <Button
                  variant="secondary"
                  className="text-white bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none"
                  onClick={handleRandom}
                >
                  Random
                </Button>
              </div>
            </div>

            {isLoadingSearch && (
              <h2 className="text-stone-400 font-bold text-center animate-pulse text-2xl pt-4">Loading...</h2>
            )}
            {!isLoadingSearch && imagesLoaded && searchResult.length > 0 && (
              <div className="w-full max-w-lg mt-6 bg-stone-800/60 p-4 border-2 border-stone-700 rounded-md">
                <div className="max-h-[400px] overflow-y-auto pr-2">
                  {searchResult.map((res, i) => {
                    return (
                      <div key={i}>
                        <div className="flex items-center space-x-4 mb-2">
                          <img
                            src={res.image}
                            className="w-16 h-auto rounded shadow"
                            alt={res.title}
                          />
                          <span className="text-white">
                            <button
                              onClick={() => handleMovieClick(res.link)}
                              className="text-blue-300 hover:text-blue-500 cursor-pointer bg-transparent border-none underline"
                            >
                              {res.title}
                            </button>{" "}
                            - {res.year}
                          </span>
                        </div>
                        <hr className="border-stone-600 pb-2" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right side cards */}
        <div className="flex flex-col gap-6 w-full max-w-lg lg:max-w-96 order-2">
          {/* User Lists Card */}
          <Card className="bg-stone-800 border-stone-700 rounded-xl shadow-lg">
            <CardHeader>
              <div className="flex text-white items-center space-x-2">
                <span className="text-xl">ⓘ</span>
                <h3 className="font-semibold">User Lists</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
                <select
                  value={selectedList ?? ''}
                  onChange={(e) => setSelectedList(Number(e.target.value))}
                  className="flex-1 px-3 py-2 rounded-lg bg-stone-700 text-white outline-none"
                  disabled={selectedList === -1}
                >
                  {userLists.map((list) => (
                    <option key={list.id} value={list.id}>
                      {list.nome_lista}
                    </option>
                  ))}
                </select>
                <Button className="bg-blue-600 hover:bg-blue-700 px-4"
                  onClick={handleCreate}
                >
                  Create
                </Button>
              </div>
              <div className="flex justify-between gap-3">
                <Button
                  className="bg-green-600 hover:bg-green-700 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleDraw}
                  disabled={selectedList === -1}
                >
                  Draw
                </Button>

                <Button
                  className="bg-yellow-500 hover:bg-yellow-600 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={selectedList === -1}
                  onClick={handleEdit}
                >
                  Edit
                </Button>

                <Button
                  className="bg-red-600 hover:bg-red-700 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={selectedList === -1}
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* User Statistics Card */}
          <Card className="bg-stone-800 border-stone-700 rounded-xl shadow-lg">
            <CardHeader>
              <div className="flex text-white items-center space-x-2">
                <span className="text-xl">ⓘ</span>
                <h3 className="font-semibold">User Statistics</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-md font-bold">
                <div className="flex justify-between">
                  <span className="text-stone-400">Last Movie</span>
                  <MovieLink movie={userStats?.lastMovie}></MovieLink>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Watched Movies</span>
                  <span className="text-blue-400 hover:text-blue-600">{userStats?.watchedMovies}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Highest Rated</span>
                  <MovieLink movie={userStats?.highestRated}></MovieLink>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Lowest Rated</span>
                  <MovieLink movie={userStats?.lowestRated}></MovieLink>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          listId={String(selectedList)}
          onMovieRated={handleMovieRated}
        />
      )}

      {isListEditOpen && selectedListData && editListMovies && (
        <ListEdit
          listName={selectedListData.nome_lista}
          movies={editListMovies}
          isOpen={isListEditOpen}
          onClose={handleListEditClose}
          handleDelete={handleDeleteFromEdit}
        />
      )}
    </div>
  )
}
