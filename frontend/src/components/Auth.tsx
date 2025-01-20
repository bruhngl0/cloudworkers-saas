import "../styles/auth.scss";
import { Link } from "react-router-dom";
import LabeledInput from "./LabeledInput";
import { useState } from "react";
import { SignupInput } from "@bruhngl/medium-saas";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";

const Auth = ({ type }: { type: "signup" | "signin" }) => {
  const [post, setPost] = useState<SignupInput>({
    email: "",
    password: "",
    name: "",
  });
  const navigate = useNavigate();

  async function sendRequest() {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/user/${type === "signin" ? "signin" : "signup"}`,
        post
      );
      const jwt = response.data;
      console.log(jwt.token);

      localStorage.setItem("token", jwt.token);
      navigate("/blog");
    } catch (error) {
      alert("Error while signing up");
    }
  }

  return (
    <div className="auth-container">
      

      <div className="form-container">
        {type === "signup" ? (
          <LabeledInput
            label="Name"
            placeholder="Aditya"
            onChange={(e) => {
              setPost({
                ...post,
                name: e.target.value,
              });
            }}
          />
        ) : null}

        <LabeledInput
          label="Email"
          placeholder="email@example.com"
          onChange={(e) => {
            setPost({
              ...post,
              email: e.target.value,
            });
          }}
        />

        <LabeledInput
          label="Password"
          placeholder="Password"
          type="password"
          onChange={(e) => {
            setPost({
              ...post,
              password: e.target.value,
            });
          }}
        />

        <button onClick={sendRequest}>Submit</button>

        <p>{type === "signup" ? "already have an account?" : "create an account"}</p>
      <Link to={type === "signin" ? "/signup" : "/signin"} className="link">
        <p>{type === "signin" ? "SIGN UP" : "SIGN IN"}</p>
      </Link>
      </div>
    </div>
  );
};

export default Auth;
