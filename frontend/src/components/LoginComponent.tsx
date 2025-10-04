import type { FormEvent } from "react";
import LoadingIcon from "../assets/circle-regular.svg?react";

type LoginComponentProps = {
  onLoginClick: (e: FormEvent<HTMLFormElement>) => void;
  errorMessage?: string;
  user_id: string;
  setUserId: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  loading?: boolean;
};

export default function LoginComponent({
  onLoginClick,
  errorMessage,
  user_id,
  setUserId,
  password,
  setPassword,
  loading = false,
}: LoginComponentProps) {
  return (
    <div className="flex lg:w-1/2 justify-center lg:justify-end items-center flex-1 lg:mr-8">
      <form
        className="flex flex-col w-full max-w-md px-10 py-9 gap-6 border border-[#E9E6E6] rounded-2xl"
        onSubmit={onLoginClick}
      >
        <h2 className="text-2xl text-center">Log In to uCAP</h2>

        <div>
          <label htmlFor="user-id" className="block text-sm mb-1">
            User ID
          </label>
          <input
            id="user-id"
            name="user_id"
            value={user_id}
            onChange={(e) => setUserId(e.target.value)}
            type="text"
            autoComplete="username"
            className="w-full text-base px-4 py-2 border border-[#E9E6E6] rounded-md"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
            className="w-full text-base px-4 py-2 border border-[#E9E6E6] rounded-md"
            disabled={loading}
          />
          <div className="h-5 text-red-500 text-sm text-center mt-2">
            {errorMessage && <p>{errorMessage}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full h-8 rounded-md text-sm transition flex justify-center items-center gap-2 text-white
            ${
              loading
                ? "bg-[#E9D4A6] cursor cursor-not-allowed"
                : "bg-ucap-yellow bg-ucap-yellow-hover cursor-pointer"
            }`}
        >
          {loading ? (
            <>
              <LoadingIcon className="animate-spin h-4 w-4" />
            </>
          ) : (
            "Log In"
          )}
        </button>
      </form>
    </div>
  );
}
