import Swal from "sweetalert2";

type iconTypes = | "success" | "warning"

export default function showToast(icon: iconTypes, title: string) {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    background: "#262626",
    color: "#ffffff"
  });
  Toast.fire({
    icon: icon,
    title: title
  });
}
