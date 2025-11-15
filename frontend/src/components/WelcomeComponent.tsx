import loginWelcome from "../assets/login-welcome.svg";

export default function WelcomeComponent() {
  return (
    <div className="hidden lg:flex lg:w-1/2 flex-col-reverse items-center justify-start lg:items-start lg:justify-center ml-8">
      <div className="flex flex-col">
        <div className="relative w-[500px] aspect-square">
          <img
            src={loginWelcome}
            alt="Login Welcome"
            loading="eager"
            decoding="async"
            className="absolute inset-0 w-full h-full"
          />
        </div>

        <p className="text-xl font-light leading-relaxed">
          Welcome to the <br />
          <span className="font-tilt-warp text-ucap-yellow text-2xl lg:text-3xl">
            University{" "}
          </span>
          <span className="font-tilt-warp text-[#1A1851] text-2xl lg:text-3xl">
            Course Assessment Portal
          </span>
        </p>
      </div>
    </div>
  );
}
