import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { decodeJwt } from 'jose'
import { useEffect, useState } from "react";

// interface UserStats {
//   lastMovie: string,
//   watchedMovies: number,
//   highestRated: string,
//   lowestRated: string
// }
//
interface UserLists {
  id: number,
  nome_lista: string
}

export default function HomeView() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null)
  const [userLists, setUserLists] = useState<UserLists[]>([])
  const [selectedList, setSelectedList] = useState<number | null>(null);

  const getUserFromToken = () => {
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
  }

  const getUserLists = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      console.log("setando o user")
      const userData = getUserFromToken();
      setUser(userData);

      if (!userData) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

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

      console.log("pegando o data")
      const raw = await response.text();
      console.log("RAW RESPONSE:", raw);

      let data;
      try {
        data = JSON.parse(raw);
      } catch (e) {
        console.error("JSON inválido vindo do backend");
        throw e;
      }

      if (!response.ok) {
        return
      }

      const lists = data.user_lists.map((l: any) => ({
        id: l.id,
        nome_lista: l.nome_lista
      }))

      setUserLists(lists);

      if (lists.length === 0) {
        setUserLists([
          {
            id: -1,
            nome_lista: 'No Lists found'
          }
        ]);
      }

      setSelectedList(lists[0].id);
      console.log(user);
    } catch (err) {
      console.error("Something went wrong: ", err);
      localStorage.removeItem("token");
      navigate("/login")
    }
  }

  const handleCreate = async () => {
    // TODO: Implement with SweetAlert2 or custom modal
    const listName = prompt('Enter your list name:')
    if (!listName || listName.trim() === '') {
      return
    }
    console.log('Creating list:', listName)
  }

  const handleDraw = () => {
    console.log('Drawing a movie')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate("/login")
  }

  useEffect(() => {
    getUserLists();
  }, []);

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
                >
                  Draw
                </Button>

                <Button
                  className="bg-yellow-500 hover:bg-yellow-600 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Edit
                </Button>

                <Button
                  className="bg-red-600 hover:bg-red-700 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <span className="text-blue-400">NONE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Watched Movies</span>
                  <span className="text-blue-400">NONE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Highest Rated</span>
                  <span className="text-blue-400">NONE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Lowest Rated</span>
                  <span className="text-blue-400">NONE</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
