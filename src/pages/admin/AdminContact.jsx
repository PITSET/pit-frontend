import { useEffect, useState } from "react";
import { getAllContacts } from "../../lib/services/adminContactService";

export default function Contact() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = async () => {
    try {
      const result = await getAllContacts();
      setContacts(result.data || []);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  if (loading) return <p>Loading contacts...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Contact Messages</h1>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 border">Name</th>
            <th className="p-3 border">Email</th>
            <th className="p-3 border">Message</th>
            <th className="p-3 border">Status</th>
          </tr>
        </thead>

        <tbody>
          {contacts.map((contact) => (
            <tr key={contact.id}>
              <td className="p-3 border">{contact.name}</td>
              <td className="p-3 border">{contact.email}</td>
              <td className="p-3 border">{contact.message}</td>
              <td className="p-3 border">{contact.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
