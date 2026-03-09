import { useEffect, useState } from "react";
import { getAboutSections } from "../../lib/services/aboutService";
import { PencilSquareIcon } from "@heroicons/react/24/outline";

import AboutModal from "../../components/admin_ui/AboutModal";

export default function AboutPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchAbout = async () => {
    try {
      const response = await getAboutSections();
      setData(response.data);
    } catch (err) {
      setError("Failed to fetch about data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbout();
  }, []);

  if (loading) return <p className="p-8">Loading...</p>;
  if (error) return <p className="p-8 text-red-500">{error}</p>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-semibold mb-8">About Page</h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-300">
            <tr className="text-sm font-semibold text-gray-600">
              <th className="px-8 py-4 text-center">Image</th>
              <th className="px-8 py-4 text-center">Title</th>
              <th className="px-8 py-4 text-center">Description</th>
              <th className="px-8 py-4 text-center">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-100 transition">
                <td className="px-8 py-4 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden mx-auto">
                    <img
                      src={item.image_url || "/placeholder.png"}
                      alt={item.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </td>

                <td className="px-8 py-6 text-center font-medium">
                  {item.title}
                </td>

                <td className="px-8 py-6 text-gray-600 text-left max-w-xl">
                  <p className="line-clamp-3">
                    {item.content || "No description available"}
                  </p>
                </td>

                <td className="px-8 py-6 text-center">
                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setIsModalOpen(true);
                    }}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-200 transition"
                  >
                    <PencilSquareIcon className="w-5 h-5 text-gray-600" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <AboutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={fetchAbout}
        item={selectedItem}
      />
    </div>
  );
}
