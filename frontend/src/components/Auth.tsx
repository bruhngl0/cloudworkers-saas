
import { Link } from "react-router-dom"
import "../styles/auth.scss"






const Auth = ({type}: {type: "signup" | "signin"}) => {
  return (
    <div>
      <p>{type === "signup" ? "already have an account" : "create an account"}</p>
       
      <Link to = {type === "signin" ? "/signup" :  "/signin"}>
        <p>{type === "signin" ? "signup" : "signin"}</p>
      </Link>

    
      
    </div>
  )
}

export default Auth