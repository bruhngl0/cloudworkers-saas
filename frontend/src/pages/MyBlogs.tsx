import  { useEffect, useState } from 'react';
import { CreateBlogInput } from "@bruhngl/medium-saas";
import axios from 'axios';
import "../styles/myblogs.scss"; // Import the SCSS file

const MyBlogs = () => {
  const [data, setData] = useState<CreateBlogInput[]>([]);

  const fetchMyBlogs = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("not logged in");
      return;
    }
    try {
      const response = await axios.get("https://backend.adityashrm500.workers.dev/api/v1/blog/myblog", {
        headers: {
          Authorization: token,
        },
      });
      console.log(response.data);
      setData(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchMyBlogs();
  }, []);

  return (
    <div className="my-blogs-container">
      <h1>My Blogs</h1>
      <ul>
        {data.map((blog, index) => (
          <li key={index}>
            <h2>{blog.title}</h2>
            <p>{blog.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MyBlogs;
