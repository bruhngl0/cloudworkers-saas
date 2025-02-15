import axios from "axios";
import { useEffect, useState } from "react";
import "../styles/quotes.scss"

type Content = {
  id: string;
  selectedText: string;
  publish: boolean;
  createdAt: string;
  authorId: string;
  category: string;
  
};

const Quotes = () => {
  const [quote, setQuote] = useState<Content[]>([]);

  const [addQuote, setAddQuote] = useState<string>("")


  const fetchBlogs = async () => {
    const token = localStorage.getItem("token"); // Retrieve token from localStorage

    if (!token) {
      console.error("Error: Token not found");
      return;
    }

    try {
      const response = await axios.get(
        "https://backend.adityashrm500.workers.dev/api/v1/quotes",
        {
          headers: {
            Authorization: token, // Include the token as the Authorization header
          },
        }
      );
      console.log(response.data)
      setQuote(response.data.quotes);
     
    } catch (err) {
      console.error("Error fetching quotes");
    }
  };




  const shipData = async( e: React.FormEvent) => {
   e.preventDefault()
   const token = localStorage.getItem("token")
   if(!token){
    alert("not logged in/session expired")
   }

   try {
    const response = await axios.post("https://backend.adityashrm500.workers.dev/api/v1/quotes", 
     {
      selectedText: addQuote
     },
     {
      headers:{
        Authorization: token
      }
     }
    )
    console.log(response)
    setAddQuote("")

    fetchBlogs()

   } catch (error) {
     console.log("error")
   }
  }

  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <div className="quotes-container">
    <h1 className="title">SAVE TEXTS ON THE GO</h1>

    <form className="quote-form" onSubmit={shipData}>
      <textarea
        placeholder="Add a quote..."
        value={addQuote}
        onChange={(e) => setAddQuote(e.target.value)}
      />
      <button type="submit">Ship it to DB</button>
    </form>

    <ul className="quotes-list">
      {quote?.map((quote, index) => (
        <li key={index} className="quote-item">
          <p className="quote-text">{quote.selectedText}</p>
          <span className="quote-category">{quote.category}</span>
        </li>
      ))}
    </ul>
  </div>
  );
};

export default Quotes;
