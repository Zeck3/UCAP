type LoginComponentProps = {
  onLoginClick: (e: React.FormEvent<HTMLFormElement>) => void;
  showError?: boolean;
  user_id: string;
  setUserId: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
};

export default function LoginComponent({
  onLoginClick,
  showError,
  user_id,
  setUserId,
  password,
  setPassword,
}: LoginComponentProps) {
  return (
    <div className="flex lg:w-1/2 justify-center lg:justify-end items-center flex-1 lg:mr-8">
      <form
        className="flex flex-col w-full max-w-md px-10 py-9 gap-6 border border-[#E9E6E6] rounded-2xl"
        onSubmit={onLoginClick}
      >
        <h2 className="text-2xl font-medium text-center">Log In to uCAP</h2>

        <div>
          <label htmlFor="user-id" className="block text-sm font-medium">
            User ID
          </label>
          <input
            id="user-id"
            name="user_id"
            value={user_id}
            onChange={(e) => setUserId(e.target.value)}
            type="text"
            autoComplete="username"
            className="w-full px-4 py-2 border border-[#E9E6E6] rounded-md focus-ring-ucap-blue"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
            className="w-full px-4 py-2 border border-[#E9E6E6] rounded-md focus-ring-ucap-blue"
          />
          <div className="h-5 text-red-500 text-sm text-center mt-1">
            {showError && <p>Invalid User ID or Password</p>}
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-ucap-yellow bg-ucap-yellow-hover text-white rounded-md text-sm transition cursor-pointer"
        >
          Log In
        </button>
      </form>
    </div>
  );
}
