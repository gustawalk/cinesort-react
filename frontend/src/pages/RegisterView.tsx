import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegisterView() {

  const navigate = useNavigate();
  const [error, setError] = useState<string>("")
  const [username, setUsername] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")

  const validateForm = (): boolean => {
    if (
      username.trim() === "" ||
      email.trim() === "" ||
      password.trim() === ""
    ) {
      setError("Some fields are missing");
      return false;
    }
    return true;
  };

  const handleRegister = async () => {

    if (!validateForm()) return;
    setError("");

    const new_user = {
      username: username,
      email: email,
      password: password
    }

    try {
      const response = await fetch("/api/register", {

        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: new_user.username,
          email: new_user.email,
          password: new_user.password
        }),
      })

      const data = await response.json();

      if (response.status === 400) {
        setError("Some fields are missing")
        return;
      }
      if (response.status === 409) {
        setError("Email or Username already taken")
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/");
    } catch (err) {
      throw err;
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-stone-900 font-sans">
      <Card className="w-full max-w-sm bg-stone-800 text-white border-stone-700 shadow-xl rounded-2xl">
        <CardHeader>
          <h2 className="text-2xl font-semibold text-center">Register</h2>
        </CardHeader>

        <CardContent>
          <form className="space-y-4">
            <div>
              <label className="block mb-2 text-stone-400">Username</label>
              <input
                type="text"
                placeholder="Username"
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-stone-700 text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-stone-400">Email</label>
              <input
                type="email"
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-stone-700 text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-stone-400">Password</label>
              <input
                type="password"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-stone-700 text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error !== "" && (
              <p className="text-red-500 font-semibold text-center text-sm">
                {error}
              </p>
            )}
            <Button
              type="button"
              className="w-full bg-blue-600 hover:bg-blue-700 font-semibold"
              onClick={handleRegister}
            >
              Register
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center mt-2">
          <p className="text-stone-400 text-sm">
            Already have an account?{" "}
            <a href="/login" className="text-blue-500 hover:underline">
              Login
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
