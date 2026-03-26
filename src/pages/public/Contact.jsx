import React, { useState } from "react";
import { FaMapMarkerAlt, FaEnvelope, FaPhone } from "react-icons/fa";
import api from "../../lib/api";
import Footer from "../../components/layout/Footer";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState(""); // success | error
  const [adminContact, setAdminContact] = useState(null);

  // Scroll to top on mount and fetch contact info
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });

    const fetchAdminContact = async () => {
      try {
        const response = await api.get("/admincontacts");
        if (response.data?.success && response.data?.data?.length > 0) {
          setAdminContact(response.data.data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch admin contact:", error);
      }
    };

    fetchAdminContact();
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
    <div className="h-[calc(100dvh-90px)] overflow-y-auto snap-y snap-mandatory scroll-smooth bg-gray-100">


      <section className="relative min-h-[calc(100dvh-90px)] snap-start flex flex-col">

        <div
          className="relative flex-grow bg-cover bg-center flex items-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee')",
          }}
        >
          <div className="absolute inset-0 bg-white/60"></div>

          <div className="relative w-full px-8">
            <h1 className="text-5xl md:text-6xl font-bold text-brand-primary leading-tight">
              Prometheus Institute of Technology
            </h1>

            <p className="mt-6 text-gray-700 max-w-xl text-lg">
              Prometheus Institute of Technology aims to educate Knyaw on the
              Thai-Myanmar border in Science, Technology, Engineering, and Math
              (STEM).
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: CONTACT SECTION */}
      <section className="min-h-screen snap-start flex items-center py-20 bg-white">
        <div className="w-full px-8 grid md:grid-cols-2 gap-16 items-start">
          {/* MAP */}
          <div className="w-full h-[500px] md:h-full min-h-[400px] bg-gray-50 rounded-2xl shadow-sm overflow-hidden">
            <iframe
              title="Location Map"
              src={adminContact?.address ? `https://maps.google.com/maps?q=${encodeURIComponent(adminContact.address)}&z=15&output=embed` : "https://maps.google.com/maps?q=Thoo%20Mweh%20Khee%20Learning%20Center,%20351,%20Phop%20Phra,%20Tak%2063160,%20Thailand&z=15&output=embed"}
              className="w-full h-full border-0"
              loading="lazy"
            ></iframe>
          </div>

          {/* CONTACT FORM */}
          <div className="flex flex-col">
            <p className="text-sm font-bold tracking-widest uppercase text-brand-primary mb-2">
              GET IN TOUCH
            </p>

            <h2 className="text-5xl font-bold font-[Roboto_Condensed] text-brand-primary leading-tight mb-6">
              Contact Us
            </h2>

            <p className="text-gray-600 text-lg mb-8">
              Have a question? We'd love to hear from you. Fill out the form and
              we'll respond promptly.
            </p>

            {/* CONTACT INFO */}
            <div className="bg-gray-50 rounded-2xl p-8 mb-10 space-y-6">
              <div className="flex items-center gap-4 group">
                <div className="p-3 bg-white rounded-full shadow-sm">
                  <FaMapMarkerAlt className="text-brand-primary text-xl" />
                </div>
                <div className="text-gray-700">
                  {adminContact?.map_url ? (
                    <a
                      href={adminContact.map_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-brand-primary transition-colors hover:underline"
                    >
                      {adminContact?.address || "351, Moo 3, District Phop Phra, Province Tak, Postcode 63150"}
                    </a>
                  ) : (
                    adminContact?.address || "351, Moo 3, District Phop Phra, Province Tak, Postcode 63150"
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="p-3 bg-white rounded-full shadow-sm">
                  <FaEnvelope className="text-brand-primary text-xl" />
                </div>
                <p className="text-gray-700">
                  {adminContact?.email || "pit@technology.com"}
                </p>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="p-3 bg-white rounded-full shadow-sm">
                  <FaPhone className="text-brand-primary text-xl" />
                </div>
                <p className="text-gray-700">
                  {adminContact?.phone || "123-456-789-0"}
                </p>
              </div>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="w-full bg-[#F7F8F8] border border-gray-200 rounded-xl px-4 py-4 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition"
                />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="w-full bg-[#F7F8F8] border border-gray-200 rounded-xl px-4 py-4 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition"
                />
              </div>

              <textarea
                rows="4"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your Message"
                className="w-full bg-[#F7F8F8] border border-gray-200 rounded-xl px-4 py-4 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition resize-none"
              ></textarea>

              {/* STATUS MESSAGE */}
              {status && (
                <div
                  className={`p-4 rounded-xl text-center text-sm font-medium ${statusType === "error"
                      ? "bg-red-50 text-brand-primary"
                      : "bg-green-50 text-green-700"
                    }`}
                >
                  {status}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex items-center justify-center bg-brand-primary text-white text-[20px] px-[1em] py-[0.8em] rounded-[16px] overflow-hidden transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-brand-primary/10"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></span>
                    <span className="block font-bold tracking-widest text-sm">SENDING...</span>
                  </>
                ) : (
                  <>
                    <div className="svg-wrapper-1">
                      <div className="svg-wrapper animate-fly-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="24"
                          height="24"
                          className="block origin-center transition-transform duration-300 ease-in-out group-hover:translate-x-[1.2em] group-hover:rotate-45 group-hover:scale-110"
                        >
                          <path fill="none" d="M0 0h24v24H0z"></path>
                          <path
                            fill="currentColor"
                            d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"
                          ></path>
                        </svg>
                      </div>
                    </div>
                    <span className="block ml-[0.5em] font-bold tracking-widest text-[16px] transition-all duration-300 ease-in-out group-hover:translate-x-[5em] group-hover:opacity-0">
                      SEND MESSAGE
                    </span>
                  </>
                )}
                <style>{`
                  @keyframes fly-1 {
                    from { transform: translateY(0.1em); }
                    to { transform: translateY(-0.1em); }
                  }
                  .group:hover .animate-fly-1 {
                    animation: fly-1 0.6s ease-in-out infinite alternate;
                  }
                `}</style>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* SECTION 3: FOOTER */}
      <section className="snap-start py-10 bg-white">
        <Footer />
      </section>
    </div>
  );
}