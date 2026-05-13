import axios
  from "axios";

const API_URL =
  import.meta.env
    .VITE_API_URL;

export async function fetchMenu() {

  const response =
    await axios.get(
      `${API_URL}/menu`
    );

  return (
    response.data || []
  );

}