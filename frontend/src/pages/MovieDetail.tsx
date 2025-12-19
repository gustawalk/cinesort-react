import { Button } from "@/components/ui/button";
import type { MovieDetail } from "@/interfaces/MovieDetail";
import type { GetUserListsOptions } from "@/interfaces/GetUserListsOptions";
import { decodeJwt } from "jose";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import showToast from "@/components/ui/toast";
import Swal from "sweetalert2";
import { appChannel } from "@/utils/broadcast";

interface UserLists {
  id: number,
  nome_lista: string
}

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movieInfo, setMovieInfo] = useState<MovieDetail>();
  const [isUserRated, setIsUserRated] = useState<boolean>(false);
  const [userRate, setUserRate] = useState<number | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [pageStatus, setPageStatus] = useState<"loading" | "ready" | "error">("loading");
  const [userLists, setUserLists] = useState<UserLists[]>([])
  const [selectedList, setSelectedList] = useState<number>(0);
  const [addButtonDisabled, setAddButtonDisabled] = useState<boolean>(false);

  const getUserFromToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const decoded = decodeJwt(token);
      return decoded;
    } catch (err) {
      console.error("Invalid token: ", err);
      return null;
    }
  };

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const userData = getUserFromToken();
    if (!userData) {
      localStorage.removeItem("token");
      navigate("/login");
      return;
    }

    return token;
  };

  const checkUserRate = async (imdb_id: string) => {
    try {
      const token = checkAuth()
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/rate/${imdb_id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.status === 204) {
        setUserRate(null);
        return;
      }

      if (!response.ok) {
        setUserRate(null)
        return;
      }

      const data = await response.json();
      if (!data) return;

      const rawRate = Number(data.rate);
      const normalizedRate = rawRate / 10;

      setUserRate(normalizedRate);
      setIsUserRated(true)
    } catch (err) {
      throw err;
    }
  }

  const getUserLists = async ({ selectLastList = false }: GetUserListsOptions = {}) => {
    try {
      const token = checkAuth()
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/list`, {
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
      console.error("Something went wrong: ", err);
      localStorage.removeItem("token");
      navigate("/login")
    }
  }

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

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/list`, {
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

  const handleBack = () => {
    if (window.history.length > 2) navigate(-1)
    else navigate("/")
  }

  const fetchMovieData = async () => {
    const token = checkAuth();
    if (!token) return;

    const request = await fetch(`${import.meta.env.VITE_API_URL}/api/movie/info/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    const data = await request.json();
    const movie = data.movie
    setMovieInfo(movie);
  };

  const handleAddToList = async () => {
    const token = checkAuth();
    if (!token) return;
    if (!movieInfo) return;
    if (selectedList == -1) {
      Swal.fire({
        title: "You don't have any list",
        text: "Try creating your first list!",
        icon: "warning",
        background: "#1c1917",
        color: "#FFFFFF",
        iconColor: "#ffdd00",
        confirmButtonText: "Ok",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    setAddButtonDisabled(true)

    try {
      const request = await fetch(`${import.meta.env.VITE_API_URL}/api/list/movie/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ listId: selectedList, movieId: movieInfo.imdb_id })
      })

      if (request.status === 200) {
        showToast("success", "Movie added")
        appChannel.postMessage({ type: "EDIT_UPDATE" })
      }
      else if (request.status === 409) {
        Swal.fire({
          title: "Movie already in the list",
          text: "Try using a different list!",
          icon: "error",
          background: "#1c1917",
          color: "#ffffff",
          iconColor: "#ef4444",
          confirmButtonText: "Ok",
          confirmButtonColor: "#2563eb",
        });
      }
    } catch (err) {
      throw err;
    } finally {
      setAddButtonDisabled(false)
    }
  }

  useEffect(() => {
    const loadPage = async () => {
      try {
        await Promise.all([
          getUserLists(),
          fetchMovieData()
        ])
      } finally {
        setPageStatus("ready")
      }
    }

    loadPage();
  }, []);

  useEffect(() => {
    if (!movieInfo?.imdb_id) return;
    checkUserRate(movieInfo.imdb_id);
  }, [movieInfo?.imdb_id]);

  if (pageStatus === "loading") {
    return (
      <div className="bg-stone-900 text-white flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  else {
    return (
      <div className="bg-stone-900 text-white flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-2xl flex flex-col gap-6 items-center">

          {/* Top actions */}
          <div className="w-full flex items-center justify-between">
            <Button className="bg-stone-700 hover:bg-stone-600 text-white px-4 py-2 rounded-lg shadow-md transition text-sm sm:text-base"
              onClick={handleBack}
            >
              ← Home
            </Button>

            {isUserRated && (
              <div className="flex items-center gap-2 align-middle -mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="30" viewBox="0 0 80 30">
                  <rect width="80" height="30" rx="8" ry="8" fill="#3B82F6" />
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    dy=".1em"
                    fontFamily="Arial, sans-serif"
                    fontSize="16"
                    fill="white"
                    fontWeight="bold">
                    User
                  </text>
                </svg>

                <svg className="w-6 h-6 text-blue-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                  width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495
                               2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067
                               2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436
                               2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z"/>
                  <title>User Rating</title>
                </svg>
                <h1 className="text-lg font-bold">{userRate} / 10</h1>
              </div>
            )}

            <div className="flex items-center gap-2 align-middle -mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="80" height="30" viewBox="0 0 80 30">
                <rect width="80" height="30" fill="#F5C518" rx="8" ry="8" />
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  dy=".1em"
                  fontFamily="Arial, sans-serif"
                  fontSize="16"
                  fill="black"
                  fontWeight="bold">
                  TMDB
                </text>
              </svg>

              <svg className="w-6 h-6 text-yellow-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495
                               2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067
                               2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436
                               2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z"/>
                <title>TMDB Rating</title>
              </svg>
              <h1 className="text-lg font-bold">{movieInfo?.imdb_rate} / 10</h1>
            </div>
          </div>

          {/* Movie Info Card */}
          <div className="text-center text-stone-300 w-full p-4 bg-stone-800 rounded-lg shadow-lg">
            <h2 className="text-xl 2xl:text-2xl font-bold text-white mb-4">
              {movieInfo?.titulo} - {movieInfo?.ano}
            </h2>

            <p>{movieInfo?.duracao}</p>

            <div className="mt-4 relative flex justify-center">
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              <img
                src={movieInfo?.poster}
                alt={movieInfo?.titulo}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(true)}
                className={`rounded-lg shadow-md max-w-xs transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"
                  }`}
              />
            </div>

            <p className="mt-4">
              <strong>Director</strong>
              <br />
              <span className="text-sm 2xl:text-base">{movieInfo?.diretor}</span>
            </p>

            <div className="mt-2">
              <strong>Synopsis</strong>
              <br />
              <div
                className="text-sm 2xl:text-base overflow-y-auto"
                style={{ maxHeight: "100px" }}
              >
                {movieInfo?.sinopse}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white py-6 px-8 rounded-lg transition duration-150"
              onClick={handleCreate}
            >
              Create
            </Button>

            <select
              value={selectedList ?? ''}
              onChange={(e) => setSelectedList(Number(e.target.value))}
              className="px-3 py-3 rounded-lg bg-stone-700 text-white outline-none"
              disabled={selectedList === -1}
            >
              {userLists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.nome_lista}
                </option>
              ))}
            </select>

            <Button className="rounded-lg shadow-md px-8 py-6 bg-green-700 text-white hover:bg-green-800 transition duration-150"
              onClick={handleAddToList}
              disabled={addButtonDisabled}
            >
              Add movie to your list
            </Button>
          </div>

        </div>
      </div>
    );
  }
}
