import loginWelcome from "../assets/login-welcome.svg";

export default function WelcomeComponent() {
  return (
    <div className="hidden lg:flex lg:w-1/2 flex-col-reverse items-center justify-start lg:items-start lg:justify-center ml-8">
      <div className="flex flex-col">
        <img
          src={loginWelcome}
          alt="Login Welcome"
          className="mb-6 w-[300px] max-w-full lg:w-[500px]"
        />

        <p className="text-xl font-light leading-relaxed">
          Welcome to the <br />
          <span className="font-tilt-warp text-ucap-yellow text-2xl lg:text-3xl">
            University{" "}
          </span>
          <span className="font-tilt-warp text-ucap-blue text-2xl lg:text-3xl">
            Course Assessment Portal
          </span>
        </p>
      </div>
    </div>
  );
}
