import axios from "axios";
import { useEffect, useState } from "react";

type Blog = {
  id: string;
  selectedText: string;
  publish: boolean;
  createdAt: string;
  authorId: string;
};

const Quotes = () => {
  const [quote, setQuote] = useState<Blog[]>([]);

  const fetchBlogs = async () => {
    const token = localStorage.getItem("token"); // Retrieve token from localStorage

    if (!token) {
      console.error("Error: Token not found");
      return;
    }

    try {
      const response = await axios.get(
        "https://backend.adityashrm500.workers.dev/api/v1/quotes/bulk",
        {
          headers: {
            Authorization: token, // Include the token as the Authorization header
          },
        }
      );

      setQuote(response.data.data);
    } catch (err) {
      console.error("Error fetching quotes");
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <div style={{ padding: "16px", maxWidth: "100vw", margin: "0 auto" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", textAlign: "center", marginBottom: "16px" }}>
        Quotes
      </h1>
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
             width: "100vw"
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
