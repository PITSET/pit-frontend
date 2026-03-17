import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../lib/api";
import resolveAssetUrl from "../../lib/resolveAssetUrl";
import Loader from "../../components/ui/Loader";

export default function InstructorDetail() {
  const { id } = useParams();
  const [instructor, setInstructor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError("");

    api
      .get(`/team-members/${encodeURIComponent(id)}`)
      .then((res) => {
        if (!isMounted) return;

        const data = res.data?.data?.data ?? res.data?.data ?? null;
        if (!data) {
          throw new Error("Instructor not found.");
        }

        setInstructor(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load instructor:", err);
        if (!isMounted) return;
        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to load instructor.";
        setError(message);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) return <Loader label="Loading Instructor Profile..." />;

  if (error) {
    return (
      <div className="max-w-[1248px] mx-auto px-4 py-10">
        <div className="p-6 border rounded text-center text-brand-primary">
          {error}
        </div>
      </div>
    );
  }

  if (!instructor) return <div className="p-10">Instructor not found.</div>;

  const program =
    instructor?.team_member_programs?.[0]?.programs?.program_name || "";

  return (
    <div className="max-w-[1248px] mx-auto px-4 py-10">

      {/* CONTENT */}
      <div className="grid md:grid-cols-2 gap-16">

        {/* IMAGE */}
        <div>
          <div className="w-full overflow-hidden rounded-lg aspect-[4/5] bg-gray-100">
            <img
              src={resolveAssetUrl(instructor.image_url)}
              alt={instructor.name}
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div>

          {/* NAME */}
          <h1 className="text-brand-primary text-4xl font-bold">
            {instructor.name}
          </h1>

          <p className="text-gray-500 mt-1 mb-6">
            {instructor.position_title}, {program}
          </p>

          {/* PROGRAM */}
          <h3 className="text-brand-primary font-semibold mb-2">
            Program
          </h3>

          <span className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-sm">
            {program}
          </span>

          {/* ACADEMIC */}
          <h3 className="text-brand-primary font-semibold mt-8 mb-2">
            Academic achievement
          </h3>

          <div className="text-sm text-gray-700 space-y-2">
            <p>
              <strong>Bachelor's Degree</strong>
              <br />
              Bachelor of Science ({program})
            </p>

            <p>
              <strong>Master's Degree</strong>
              <br />
              Master of Science ({program})
            </p>
          </div>

          {/* INFORMATION */}
          <h3 className="text-brand-primary-dark text-2xl font-semibold mb-6">
            Information
          </h3>

          <div className="space-y-8">

            {/* POSITION */}
            <div className="flex items-center gap-6">

              <div className="w-[53px] h-[46px] flex items-center justify-center bg-white border rounded-[4px] shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-7 h-7 text-brand-primary-dark"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 12c2.761 0 5-2.462 5-5.5S14.761 1 12 1 7 3.462 7 6.5 9.239 12 12 12z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 22c0-4 4-7 9-7s9 3 9 7"
                  />
                </svg>
              </div>

              <div>
                <p className="text-xl font-semibold text-gray-900">
                  Position
                </p>
                <p className="text-lg text-gray-700">
                  {instructor.position_title}
                </p>
              </div>

            </div>

            {/* EMAIL */}
            <div className="flex items-center gap-6">

              <div className="w-[53px] h-[46px] flex items-center justify-center bg-white border rounded-[4px] shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-7 h-7 text-brand-primary-dark"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4h16v16H4z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6l8 7 8-7"
                  />
                </svg>
              </div>

              <div>
                <p className="text-xl font-semibold text-gray-900">
                  Email
                </p>
                <p className="text-lg text-gray-700">
                  {instructor.email}
                </p>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
