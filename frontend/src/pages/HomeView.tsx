import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { decodeJwt } from 'jose'
import { useCallback, useEffect, useState } from "react";
import { MovieLink } from "@/components/utility/MovieLink";
import { MovieModal } from "@/components/utility/MovieModal";
import type { MovieInfo } from "@/interfaces/MovieInfo";
import Swal from 'sweetalert2';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<MovieInfo | null>(null)


  const getUserFromToken = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const decoded = decodeJwt(token);
      console.log(decoded);
      return decoded;
    } catch (err) {
      console.error('Invalid token: ', err)
      return null;
    }
  }, [])

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

      console.log("fazendo o fetch dos stats");

      const response = await fetch("/api/userStats", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();
      const dataUserStats = data.user_stats;

      console.log(dataUserStats)
      setUserStats(dataUserStats);
    } catch (err) {
      console.log(err)
    }
  }, [checkAuth, navigate])

  const getUserLists = useCallback(async () => {
    try {
      const token = checkAuth()
      if (!token) return;

      console.log("fazendo o fetch")

      const response = await fetch("/api/userLists", {
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
        nome_lista: l.nome_lista
      }))

      setUserLists(lists);

      console.warn(`LISTA`, userLists)

      if (lists.length === 0) {
        setUserLists([{
          id: -1,
          nome_lista: 'No Lists found'
        }]);
        setSelectedList(-1);
      } else {
        setUserLists(lists);
        setSelectedList(lists[0].id);
      }

      console.log("Updated lists: ", lists)
    } catch (err) {
      console.error("Something went wrong: ", err);
      localStorage.removeItem("token");
      navigate("/login")
    }
  }, [navigate, checkAuth])

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

    if (newListName.trim('') === '') return;
    console.log('Creating list:', newListName)
  }

  const handleDraw = () => {
    console.log(`Drawing from ${selectedList}`)
    // TODO: get a real movie from the selectedList id
    const fictionalMovie = {
      imdb_id: "tt9999999",
      titulo: "The Last Algorithm",
      ano: "2024",
      duracao: "2h 18min",
      poster: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEqd0iZgIixK8f2Q1jJilA5cpT1cwfdWgYoQ&s",
      imdb_rate: "8.7"
    }
    setSelectedMovie(fictionalMovie);
    setIsModalOpen(true);
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedMovie(null)
  }

  const handleMovieRated = () => {
    // TODO: handle after rating, as updating user statistics and removing pendency
    console.log('handle after rate')
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
        await Promise.all([getUserLists(), getUserStats()]);
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
              />
              <div className="flex gap-2">
                <Button className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none">
                  Search
                </Button>
                <Button
                  variant="secondary"
                  className="text-white bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none"
                >
                  Random
                </Button>
              </div>
            </div>
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
                >
                  Edit
                </Button>

                <Button
                  className="bg-red-600 hover:bg-red-700 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={selectedList === -1}
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

      {/* Modal - Rendered at root level */}
      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          listId={String(selectedList)}
          onMovieRated={handleMovieRated}
        />
      )}
    </div>
  )
}
