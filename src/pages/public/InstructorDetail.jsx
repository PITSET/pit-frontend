import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../lib/api";
import resolveAssetUrl from "../../lib/resolveAssetUrl";

export default function InstructorDetail() {
  const { id } = useParams();
  const [instructor, setInstructor] = useState(null);

  useEffect(() => {
    api.get(`/team-members/${id}`).then((res) => {
      setInstructor(res.data.data);
    });
  }, [id]);

  if (!instructor) return <div className="p-10">Loading...</div>;

  const program =
    instructor?.team_member_programs?.[0]?.programs?.program_name || "";

  return (
    <div className="max-w-[1248px] mx-auto px-4 py-10">

    {/* BREADCRUMB */}
<div className="flex items-center gap-3 mb-8 font-roboto text-[16px] font-bold">

  <Link
    to="/"
    className="text-gray-700 hover:text-red-600 transition"
  >
    Home
  </Link>

  <span className="text-gray-500">›</span>

  <Link
    to="/about"
    className="text-gray-700 hover:text-red-600 transition"
  >
    About
  </Link>

  <span className="text-gray-500">›</span>

  <Link
    to="/instructors"
    className="text-gray-700 hover:text-red-600 transition"
  >
    Instructors
  </Link>

  <span className="text-red-600">›</span>

  <span className="text-red-600">
    {instructor.name}
  </span>

</div>

      {/* CONTENT */}
      <div className="grid md:grid-cols-2 gap-16">

        {/* IMAGE */}
        <div>
          <img
            src={resolveAssetUrl(instructor.image_url)}
            alt={instructor.name}
            className="w-full rounded-lg object-cover"
          />
        </div>

        {/* RIGHT CONTENT */}
        <div>

          {/* NAME */}
          <h1 className="text-red-600 text-4xl font-bold">
            {instructor.name}
          </h1>

          <p className="text-gray-500 mt-1 mb-6">
            {instructor.position_title}, {program}
          </p>

          {/* PROGRAM */}
          <h3 className="text-red-600 font-semibold mb-2">
            Program
          </h3>

          <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm">
            {program}
          </span>

          {/* ACADEMIC */}
          <h3 className="text-red-600 font-semibold mt-8 mb-2">
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
        <h3 className="text-red-700 text-2xl font-semibold mb-6">
  Information
</h3>

<div className="space-y-8">

  {/* POSITION */}
  <div className="flex items-center gap-6">

    <div className="w-[53px] h-[46px] flex items-center justify-center bg-white border rounded-[4px] shadow-md">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-7 h-7 text-red-700"
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
        className="w-7 h-7 text-red-700"
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