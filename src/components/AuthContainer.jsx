import { useState } from "react";
import Login from "../pages/Login";
import Signup from "../pages/Signup";

const AuthContainer = () => {
  const [isLogin, setIsLogin] = useState(true);

  const switchToSignup = () => setIsLogin(false);
  const switchToLogin = () => setIsLogin(true);

  return (
    <>
      {isLogin ? (
        <Login switchToSignup={switchToSignup} />
      ) : (
        <Signup switchToLogin={switchToLogin} />
      )}
    </>
  );
};

export default AuthContainer;
