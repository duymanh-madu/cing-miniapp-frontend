import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import useAdminAuthStore from "../adminAuthStore";

function AdminLoginPage() {

  const navigate =
    useNavigate();

  const setAdminAuth =
    useAdminAuthStore(
      (
        state
      ) =>
        state.setAdminAuth
    );

  const [
    username,
    setUsername,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  async function handleLogin(
    e
  ) {

    e.preventDefault();

    /**
     * TODO:
     * replace real api
     */

    setAdminAuth({

      admin: {

        username,

      },

      accessToken:
        "temporary-admin-token",

    });

    navigate(
      "/admin/dashboard"
    );

  }

  return (

    <div
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-black
        text-white
      "
    >

      <form
        onSubmit={
          handleLogin
        }
        className="
          w-full
          max-w-md
          rounded-3xl
          bg-zinc-900
          p-8
        "
      >

        <div
          className="
            mb-6
            text-3xl
            font-black
          "
        >
          Admin Login
        </div>

        <input
          value={username}
          onChange={(e) =>
            setUsername(
              e.target.value
            )
          }
          placeholder="Username"
          className="
            mb-4
            w-full
            rounded-xl
            bg-zinc-800
            p-4
          "
        />

        <input
          type="password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          placeholder="Password"
          className="
            mb-6
            w-full
            rounded-xl
            bg-zinc-800
            p-4
          "
        />

        <button
          type="submit"
          className="
            w-full
            rounded-xl
            bg-white
            p-4
            font-bold
            text-black
          "
        >
          Login
        </button>

      </form>

    </div>

  );

}

export default
  AdminLoginPage;