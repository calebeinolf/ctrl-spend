import Logo from "../assets/ctrlspend_favicon2.svg";

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <img
          src={Logo}
          alt="Ctrl+Spend"
          className="mx-auto mb-4 w-60 h-60 opacity-80 translate-y-[10px]"
        />
        {/* <div className="w-6 h-6 border-2 border-lime-600 border-t-transparent rounded-full animate-spin mx-auto"></div> */}
      </div>
    </div>
  );
};

export default LoadingScreen;
