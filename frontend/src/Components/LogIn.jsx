import React from "react";
import { useNavigate } from "react-router-dom";
import "./LogIn.css";
import logo from "../assets/connect-logo.png"


export default function LogIn() {
  const navigate = useNavigate();

  const handleLogInClick = () => {
    navigate("/challenges");
  };

  return (
    <div id="logInDiv">
     <img id = "logo" src={logo} alt="app logo" />
      <h1 id = "title">Connect Quest</h1>
      <button className="buttons" onClick={handleLogInClick}>
        Log in
      </button>
      <button className="buttons" onClick={handleLogInClick}>Sign up</button>
    </div>
  );
}
