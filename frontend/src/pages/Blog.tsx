import  { useEffect, useState } from "react";
import axios from "axios";
import { CreateBlogInput } from "@bruhngl/medium-saas";
import "../styles/blog.scss"; // Import the SCSS file
import { Link } from "react-router-dom";

const BlogList = () => {
  const [blogs, setBlogs] = useState<CreateBlogInput[]>([]);
  const [content, setContent] = useState<string>("");
  const [title, setTitle] = useState<string>("");

  const postBlog = async(e: React.FormEvent)=>{
    e.preventDefault();
     const token = localStorage.getItem("token");
     if(!token){
      alert("not logged in")
      return;
     }
     try {
      const response = await axios.post("https://backend.adityashrm500.workers.dev/api/v1/blog", {
        title: title,
        content: content,
   },
      {
        headers:{
          Authorization: token, 
        }
      }
      )
      
      console.log(response)
      setTitle("")
      setContent("")
      fetchBlogs()
     } catch (error) {
       console.log(error)
     }
  }

  const fetchBlogs = async () => {
    const token = localStorage.getItem("token"); // Retrieve token from localStorage
    if (!token) {
      console.log("error");
      return;
    }

   
    console.log(token);
    try {
      const response = await axios.get(
        "https://backend.adityashrm500.workers.dev/api/v1/blog/bulk",
        {
          headers: {
            Authorization: token, // Include the token as the Authorization header
          },
        }
      );
      console.log(response.data);
      setBlogs(response.data.blogs);
    } catch (err) {
      console.error("error");
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <div className="blog-container">
      <form>
      
      <input placeholder="title"
        value={title}
        onChange={(e)=> setTitle(e.target.value)}
        /> 


        <input placeholder="content"
        value={content}
        onChange={(e)=> setContent(e.target.value)}
        /> 

     
        <button type="submit" onClick={postBlog}>add blog</button>
        
      </form>
     <div>
      <Link to= "/myblogs" style={{marginRight: "5rem" , fontWeight: "900" , color: "red"}}>
       MY MANNUAL INPUT DATA
      </Link>

      <a href= "/quotes" style={{marginRight: "5rem" , fontWeight: "900" , color: "red"}}>
        WEBAPGE CONTENT DB
      </a>
      </div>
      <ul>
        {blogs.length > 0 ? (
          blogs.map((blog, index) => (
            <li key={index}>
              <h2>{blog.title}</h2>
              <p>{blog.content}</p>
            </li>
          ))
        ) : (
          <p className="no-blogs">No blogs available.</p>
        )}
      </ul>
    </div>
  );
};

export default BlogList;

