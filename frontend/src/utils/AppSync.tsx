import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { appChannel } from "./broadcast";

export default function AppSync() {

  const navigate = useNavigate();

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      switch (event.data?.type) {
        case "LOGOUT":
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login", { replace: true })
          break;
        case "LOGIN":
          navigate("/", { replace: true })
          break;
      }
    };

    appChannel.addEventListener("message", handler);
    return () => appChannel.removeEventListener("message", handler);
  }, [navigate]);

  return null;
}
