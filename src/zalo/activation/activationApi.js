import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL;

export async function activateMiniAppUser(payload) {
  const response = await axios.post(
    `${API_BASE_URL}/activation/bootstrap`,
    payload
  );

  return response.data;
}