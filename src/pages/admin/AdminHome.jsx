import { useEffect, useState } from "react";

import api from "../../lib/api";

export default function HomePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHome = async () => {
      try {
        const response = await api.get("/home");

        setData(response.data);
      } catch (err) {
        setError("Failed to fetch home data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHome();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Home Data</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
