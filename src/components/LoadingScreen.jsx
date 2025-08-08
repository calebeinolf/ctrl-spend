import Logo from "../assets/ctrlspend_favicon2.svg";

const LoadingScreen = () => {
  return (
    <div className="min-h-screen md-surface flex items-center justify-center">
      <div className="text-center">
        <img src={Logo} alt="Ctrl+Spend" className="mx-auto mb-4 w-60 h-60" />
      </div>
    </div>
  );
};

export default LoadingScreen;
