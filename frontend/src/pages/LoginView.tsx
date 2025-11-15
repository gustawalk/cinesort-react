import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginView() {
  const navigate = useNavigate();

  const [error, setError] = useState<string>('')
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')

  const validateForm = (): boolean => {
    if (!username || !password) {
      setError("Por favor, preencha todos os campos");
      return false;
    }

    setError("");
    return true;
  }

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    const user = {
      username: username,
      password: password
    }

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: user.username,
          password: user.password
        }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        setError("Username or password are incorrect!");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      console.log(data)
      navigate("/");
    } catch (err) {
      setError("Something went wrong, try again later.");
    };
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-stone-900 font-sans">
      <Card className="w-full max-w-sm bg-stone-800 text-white border-stone-700 shadow-xl rounded-2xl">
        <CardHeader>
          <h2 className="text-2xl font-semibold text-center">Login</h2>
        </CardHeader>

        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div>
              <label className="block mb-2 text-stone-400">Username</label>
              <input
                type="text"
                placeholder="Username"
                className="w-full px-3 py-2 rounded-lg bg-stone-700 text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-2 text-stone-400">Password</label>
              <input
                type="password"
                placeholder="Password"
                className="w-full px-3 py-2 rounded-lg bg-stone-700 text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 font-semibold mt-4"
              onClick={handleLogin}
            >
              Login
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-stone-400 text-sm">
            Don't have an account?{" "}
            <a href="/register" className="text-blue-500 hover:underline">
              Register
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
