
import { BrowserRouter as Router, Routes, Route  } from 'react-router-dom'
import Signup from "./pages/Signup"
import Signin from './pages/Signin'
import Blog from './pages/Blog'
import Quotes from './pages/Quotes'
import MyBlogs from './pages/MyBlogs'
import './App.css'
function App() {


  return (
    <>
    <Router>
      <Routes>
       <Route path = "/signup" element = {<Signup />} />
       <Route path = "/signin" element = {<Signin />} />
       <Route path='/blog' element= {<Blog />} />
       <Route path='/quotes' element= {<Quotes />} />
       <Route path= "/myblogs" element = {<MyBlogs/>} />

      </Routes>
    </Router>
     

    </>
  )
}

export default App
