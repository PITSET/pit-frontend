import { useEffect, useState } from "react";
import api from "../../lib/api";
import { PencilSquareIcon } from "@heroicons/react/24/outline";

// import modal
import Modal from "../../components/admin_ui/HomeModal";

export default function HomePage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  //Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

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
          <thead className="bg-gray-50 border-b border-gray-300 px-10">
            <tr className="text-left text-sm font-semibold text-gray-600">
              <th className="px-8 py-4 w-40 text-center">Image</th>
              <th className="px-8 py-4 w-60 text-center">Title</th>
              <th className="px-8 py-4 text-center">Description</th>
              <th className="px-8 py-4 text-center w-32">Action</th>
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-100 transition">
                {/* Image */}
                <td className="px-8 py-4 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                    <img
                      src={item.image_url || "/placeholder.png"}
                      alt={item.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </td>

                {/* Title */}
                <td className="px-8 py-6 font-medium text-gray-800 text-center">
                  {item.title}
                </td>

                {/* Description */}
                <td className="px-8 py-6 text-gray-600 max-w-xl text-left">
                  {item.content || "No description available"}
                </td>

                {/* Action */}
                <td className="px-8 py-6 text-center">
                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setIsModalOpen(true);
                    }}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-200 hover:cursor-pointer transition"
                  >
                    <PencilSquareIcon className="w-5 h-5 text-gray-600" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Edit ${selectedItem?.title || ""}`}
      >
        {selectedItem && (
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                defaultValue={selectedItem.title}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                defaultValue={selectedItem.content}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Save
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
