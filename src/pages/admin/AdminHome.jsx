import { useEffect, useState } from "react";
import api from "../../lib/api";
import { PencilSquareIcon } from "@heroicons/react/24/outline";

export default function HomePage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHome = async () => {
      try {
        const response = await api.get("/home");
        setData(response.data.data);
      } catch (err) {
        setError("Failed to fetch home data");
      } finally {
        setLoading(false);
      }
    };

    fetchHome();
  }, []);

  if (loading) return <p className="p-8">Loading...</p>;
  if (error) return <p className="p-8 text-red-500">{error}</p>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Title */}
      <h1 className="text-3xl font-semibold mb-8">Home Page</h1>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          {/* Header */}
          <thead className="bg-gray-50 border-b border-gray-300">
            <tr className="text-left text-sm font-semibold text-gray-600">
              <th className="px-8 py-4 w-40">Image</th>
              <th className="px-8 py-4 w-60">Title</th>
              <th className="px-8 py-4">Description</th>
              <th className="px-8 py-4 text-center w-32">Action</th>
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-100 transition">
                {/* Image */}
                <td className="px-8 py-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                    <img
                      src={item.image_url || "/placeholder.png"}
                      alt={item.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </td>

                {/* Title */}
                <td className="px-8 py-6 font-medium text-gray-800">
                  {item.title}
                </td>

                {/* Description */}
                <td className="px-8 py-6 text-gray-600 max-w-xl">
                  {item.content || "No description available"}
                </td>

                {/* Action */}
                <td className="px-8 py-6 text-center">
                  <button className="p-2 rounded-lg border border-gray-400 hover:bg-gray-200 hover:cursor-pointer transition">
                    <PencilSquareIcon className="w-5 h-5 text-gray-600" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
