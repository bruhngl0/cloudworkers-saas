import axios from "axios";
import { useEffect, useState } from "react";



const Quotes = () => {
 
    type Blog = {
        id: string;
        selectedText: string;
        publish: boolean;
        createdAt: string;
        authorId: string;
      };
  const [quote, setQuote] = useState<Blog[]>([])


  const fetchBlogs = async () => {
    const token = localStorage.getItem("token"); // Retrieve token from localStorage

    if (!token) {
      console.log("error")
      return;
    }
     console.log(token)
    try {
      const response = await axios.get(
        "https://backend.adityashrm500.workers.dev/api/v1/quotes/bulk",
        {
          headers: {
            Authorization: token, // Include the token as the Authorization header
          },
        }
      );

     console.log(response.data)
     setQuote(response.data.data)
  

    } catch (err) {
      console.error("error");
    
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <div>
      <h1>quotes</h1>
      <ul>
      {
        quote?.map((quote, index)=>(
            <li key = {index}>{quote.selectedText}</li>
        ))
      }
    
    </ul>
    </div>
  );
};

export default Quotes;