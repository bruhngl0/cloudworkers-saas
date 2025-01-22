import axios from "axios";
import { useEffect, useState } from "react";

type Content = {
  id: string;
  selectedText: string;
  publish: boolean;
  createdAt: string;
  authorId: string;
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
    <div style={{ padding: "16px", maxWidth: "100vw", margin: "0 auto" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", textAlign: "center", marginBottom: "16px", fontFamily: "helvetica" }}>
      SAVE TEXTS ON THE GO
      </h1>

      <form>
      <textarea
          placeholder="add quote"
          value={addQuote}
          onChange={(e) => setAddQuote(e.target.value)}
          style={{
            width: "100%",
            minHeight: "100px",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ddd",
            resize: "vertical", // Allows vertical resizing
          }}
        />
        <button type= "submit" onClick={shipData}>ship it to db</button>
      </form>
      <ul style={{ listStyle: "none", padding: "0" }}>
        {quote?.map((quote, index) => (
          <li
            key={index}
            style={{
              backgroundColor: "#f4f4f4",
              border: "1px solid #ddd",
              padding: "8px",
              marginBottom: "8px",
              borderRadius: "4px",
              width: "100%",
              fontFamily: "helvetica",
        
              whiteSpace: "pre-wrap", // Preserves line breaks in displayed text
            }}
          >
            {quote.selectedText}
          </li>
        ))}
      </ul>

    </div>
  );
};

export default Quotes;
