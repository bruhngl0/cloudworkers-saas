import axios from "axios";
import { useEffect, useState } from "react";
import {CreateBlogInput} from "@bruhngl/medium-saas"


const BlogList = () => {
 
const [blogs, setBlogs] = useState<CreateBlogInput[]>([])



  const fetchBlogs = async () => {
    const token = localStorage.getItem("token"); // Retrieve token from localStorage

    if (!token) {
      console.log("error")
      return;
    }
     console.log(token)
    try {
      const response = await axios.get(
        "https://backend.adityashrm500.workers.dev/api/v1/blog/bulk",
        {
          headers: {
            Authorization: token, // Include the token as the Authorization header
          },
        }
      );

     console.log(response.data)
     setBlogs(response.data.blogs)

    } catch (err) {
      console.error("error");
    
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <div>
      <h1>Blogs</h1>
      <ul>
        {blogs.length > 0 ? (
          blogs.map((blog, index) => (
            <li key={index}>
              <h2>{blog.title}</h2>
              <p>{blog.content}</p>
            </li>
          ))
        ) : (
          <p>No blogs available.</p>
        )}
      </ul>
    
      
    </div>
  );
};

export default BlogList;

