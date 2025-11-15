import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RegisterView() {
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
                className="w-full px-3 py-2 rounded-lg bg-stone-700 text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-stone-400">Email</label>
              <input
                type="email"
                placeholder="Email"
                className="w-full px-3 py-2 rounded-lg bg-stone-700 text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-stone-400">Password</label>
              <input
                type="password"
                placeholder="Password"
                className="w-full px-3 py-2 rounded-lg bg-stone-700 text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <p className="text-red-500 text-center text-sm hidden">
              {/* errorMessage */}
            </p>

            <Button
              type="button"
              className="w-full bg-blue-600 hover:bg-blue-700 font-semibold"
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
