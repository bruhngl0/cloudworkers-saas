
import { Link } from "react-router-dom"
import LabeledInput from "./LabeledInput"
import "../styles/auth.scss"
import { useState } from "react"
import { SignupInput } from "@bruhngl/medium-saas"
import { useNavigate } from "react-router-dom"
import  axios  from "axios"
import { BACKEND_URL } from "../config"






const Auth = ({type}: {type: "signup" | "signin"}) => {

  const [post, setPost] = useState<SignupInput>({
    email: "",
    password: "",
    name: ""
   
   })
const navigate = useNavigate()

   async function sendRequest(){
   try {
    const response = await axios.post(`${BACKEND_URL}/api/v1/user/${type === "signin" ? "signin" : "signup"}` , post)
    const jwt = response.data
    console.log(jwt.token)

    localStorage.setItem("token" , jwt.token)
     navigate("/blog")
   } catch (error) {
    alert("error while signing up")
   }

   }
  return (

    <div>
      <p>{type === "signup" ? "already have an account" : "create an account"}</p>
      <Link to = {type === "signin" ? "/signup" :  "/signin"}>
        <p>{type === "signin" ? "signup" : "signin"}</p>
      </Link>


      {type === "signup" ? <LabeledInput 
        label= "name" 
        placeholder="aditya"
        onChange={(e)=>{
           setPost({
            ...post,
            name: e.target.value
           })
        }} /> : null }
      
      


        <LabeledInput 
         label = "email"
         placeholder="email"
         onChange={(e)=>{
          setPost({
            ...post,
            email : e.target.value
          })
         }}
        />


        <LabeledInput 
        label= "password"
        placeholder= "password"
        type = "password"
        onChange={(e)=>{
          setPost({
            ...post,
            password : e.target.value
          })
        }}/>
       

       <button onClick={sendRequest}>submit</button>
       
      

    
      
    </div>
  )
}

export default Auth