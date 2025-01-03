import axios from "axios";
import { useEffect } from "react";


const BlogList = () => {
 


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
      

      
    </div>
  );
};

export default BlogList;

