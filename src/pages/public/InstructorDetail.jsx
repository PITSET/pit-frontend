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
    <div className="bg-white min-h-screen py-12">
      <div className="max-w-[1248px] mx-auto pb-16 px-6">

        {/* CONTENT */}
        <div className="grid md:grid-cols-2 gap-16">

          {/* IMAGE */}
          <div>
            <div className="w-full overflow-hidden rounded-lg aspect-4/5 bg-gray-100">
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
            <h3 className="text-brand-primary-dark font-semibold mb-2">
              Program
            </h3>

            <span className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-sm">
              {program}
            </span>

            {/* ACADEMIC */}
            <h3 className="text-brand-primary-dark font-semibold mt-8 mb-4">
              Academic achievement
            </h3>

            <div className="text-sm text-gray-700 space-y-3">
              {instructor.academic_achievements && Array.isArray(instructor.academic_achievements) && instructor.academic_achievements.length > 0 ? (
                instructor.academic_achievements.map((achievement, index) => (
                  <div key={index} className="flex gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-1.5 shrink-0" />
                    <p className="text-gray-800 leading-relaxed font-medium">
                      {achievement}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No academic achievements listed.</p>
              )}
            </div>

            {/* INFORMATION */}
            <h3 className="text-brand-primary-dark font-semibold mt-10 mb-5">
              Information
            </h3>

            <div className="space-y-6">
              {/* POSITION */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-10 flex items-center justify-center bg-white border border-gray-100 rounded shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 text-brand-primary-dark"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
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
                  <h4 className="text-sm font-bold text-gray-900 leading-none mb-1">
                    Position
                  </h4>
                  <p className="text-[15px] text-gray-600">
                    {instructor.position_title}
                  </p>
                </div>
              </div>

              {/* EMAIL */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-10 flex items-center justify-center bg-white border border-gray-100 rounded shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 text-brand-primary-dark"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-3.586a1 1 0 00-.707.293l-1.414 1.414a1 1 0 01-.707.293h-2.122a1 1 0 01-.707-.293l-1.414-1.414A1 1 0 008.586 13H4"
                    />
                  </svg>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-900 leading-none mb-1">
                    Email
                  </h4>
                  <p className="text-[15px] text-gray-600">
                    {instructor.email}
                  </p>
                </div>
              </div>
            </div>

            {/* SKILLS */}
            <h3 className="text-brand-primary-dark font-semibold mt-10 mb-4">
              Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {(() => {
                let skillsArray = [];
                try {
                  if (Array.isArray(instructor.skills)) {
                    skillsArray = instructor.skills;
                  } else if (typeof instructor.skills === "string") {
                    if (instructor.skills.startsWith("[")) {
                      skillsArray = JSON.parse(instructor.skills);
                    } else if (instructor.skills.trim()) {
                      skillsArray = instructor.skills.split(",").map(s => s.trim());
                    }
                  }
                } catch (e) {
                  console.error("Failed to parse skills:", e);
                }

                return skillsArray.length > 0 ? (
                  skillsArray.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-[#FFE5D8] text-gray-800 px-4 py-1.5 rounded-full text-xs font-semibold border border-[#FFD8C4]"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 italic text-sm">No specific skills listed.</p>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
