import React, { useState } from "react";
import { FaMapMarkerAlt, FaEnvelope, FaPhone } from "react-icons/fa";
import api from "../../lib/api";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState(""); // success | error

  // Scroll to top on mount
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!formData.fullName || !formData.email || !formData.message) {
      setStatus("❌ Please fill in all required fields.");
      setStatusType("error");
      return;
    }

    try {
      setLoading(true);
      setStatus("");
      setStatusType("");

      const response = await api.post("/contacts", {
        name: formData.fullName,
        email: formData.email,
        message: formData.message,
      });

      const data = response?.data;

      if (data?.success) {
        setStatus("✅ Message sent successfully!");
        setStatusType("success");

        setFormData({
          fullName: "",
          email: "",
          message: "",
        });
      } else {
        setStatus(data?.error || "❌ Failed to send message.");
        setStatusType("error");
      }
    } catch (error) {
      const backendError =
        error?.response?.data?.error ||
        error?.response?.data?.message;

      setStatus(backendError || "❌ Server error. Please try again.");
      setStatusType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* HERO */}
      <div
        className="relative h-[360px] bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee')",
        }}
      >
        <div className="absolute inset-0 bg-white/60"></div>

        <div className="relative max-w-7xl mx-auto px-6 pt-24">
          <h1 className="text-5xl font-bold text-brand-primary">
            Prometheus Institute of Technology
          </h1>

          <p className="mt-4 text-gray-700 max-w-xl">
            Prometheus Institute of Technology aims to educate Knyaw on the
            Thai-Myanmar border in Science, Technology, Engineering, and Math
            (STEM).
          </p>
        </div>
      </div>

      {/* CONTACT SECTION */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-stretch">
        {/* MAP */}
        <div className="w-full h-full bg-white rounded-lg shadow overflow-hidden">
          <iframe
            title="Thoo Mweh Khee Learning Center"
            src="https://maps.google.com/maps?q=Thoo%20Mweh%20Khee%20Learning%20Center,%20351,%20Phop%20Phra,%20Tak%2063160,%20Thailand&z=15&output=embed"
            className="w-full h-full border-0"
            loading="lazy"
          ></iframe>
        </div>

        {/* CONTACT FORM */}
        <div className="flex flex-col h-full">
          <p className="text-sm font-semibold uppercase text-brand-primary">
            GET IN TOUCH
          </p>

          <h2 className="text-4xl font-bold mt-1">
            <span className="text-[#5B616E]">Contact </span>
            <span className="text-brand-primary">Us</span>
          </h2>

          <p className="text-gray-500 mt-3">
            Have a question? We'd love to hear from you. Fill out the form and
            we'll respond promptly.
          </p>

          {/* CONTACT INFO */}
          <div className="bg-white shadow-md rounded-lg p-5 mt-6 space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <FaMapMarkerAlt className="text-brand-primary" />
              <p>
                351, Moo 3, District Phop Phra, Province Tak, Postcode 63150
              </p>
            </div>

            <div className="flex items-center gap-3">
              <FaEnvelope className="text-brand-primary" />
              <p>pit@technology.com</p>
            </div>

            <div className="flex items-center gap-3">
              <FaPhone className="text-brand-primary" />
              <p>123-456-789-0</p>
            </div>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full bg-[#F7F8F8] border rounded-md px-4 py-3 focus:outline-none"
            />

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full bg-[#F7F8F8] border rounded-md px-4 py-3 focus:outline-none"
            />

            <textarea
              rows="5"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Your Message"
              className="w-full bg-[#F7F8F8] border rounded-md px-4 py-3 focus:outline-none"
            ></textarea>

            {/* STATUS MESSAGE */}
            {status && (
              <p
                className={`text-center text-sm font-medium ${
                  statusType === "error"
                    ? "text-brand-primary"
                    : statusType === "success"
                    ? "text-green-600"
                    : "text-gray-700"
                }`}
              >
                {status}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-primary text-white py-3 rounded-md font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Sending...
                </>
              ) : (
                "SEND MESSAGE"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}