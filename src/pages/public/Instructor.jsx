import { useState, useEffect } from "react";
import api from "../../lib/api";
import resolveAssetUrl from "../../lib/resolveAssetUrl";

export default function Instructor() {
  const [instructors, setInstructors] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [error, setError] = useState("");

  const tabs = [
    "All",
    "Mechatronics Engineering",
    "Software Engineering",
    "Mechanical Engineering",
  ];

  // FETCH DATA
  useEffect(() => {
    let isMounted = true;

    api
      .get("/team-members")
      .then((res) => {
        if (!isMounted) return;
        const members = res.data?.data || [];
        setInstructors(members.filter((m) => m?.is_instructor));
        setError("");
      })
      .catch((err) => {
        console.error("Failed to load instructors:", err);
        if (!isMounted) return;
        setError("Failed to load instructors.");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // FILTER BY PROGRAM
  const filtered =
    activeTab === "All"
      ? instructors
      : instructors.filter((i) =>
          i?.team_member_programs?.some(
            (p) => p?.programs?.program_name === activeTab
          )
        );

  return (
    <div className="max-w-[1248px] mx-auto py-16 px-4">
      {/* TITLE */}
      <h1 className="text-center text-red-600 font-bold text-[64px] mb-12">
        Instructors
      </h1>

      {/* MOBILE DROPDOWN */}
      <div className="md:hidden mb-8">
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
          className="w-full border p-3 rounded"
        >
          {tabs.map((tab) => (
            <option key={tab} value={tab}>
              {tab}
            </option>
          ))}
        </select>
      </div>

      {/* DESKTOP TABS */}
      <div className="hidden md:flex relative w-full h-[67px] bg-[#F8F8FF] border-b-4 border-gray-400">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 relative flex items-center justify-center text-sm font-medium"
          >
            <span
              className={
                activeTab === tab ? "text-red-600" : "text-gray-600"
              }
            >
              {tab}
            </span>

            {activeTab === tab && (
              <span className="absolute bottom-[-4px] left-0 w-full h-[4px] bg-red-600"></span>
            )}
          </button>
        ))}
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 mt-10">
        {error ? (
          <div className="col-span-full text-center text-red-600">{error}</div>
        ) : null}
        {filtered.map((inst) => {
          const program =
            inst?.team_member_programs?.[0]?.programs?.program_name || "";

          return (
            <div key={inst.id} className="w-full md:w-[312px]">
              {/* IMAGE */}
              <img
                src={resolveAssetUrl(inst.image_url)}
                alt={inst.name}
                className="w-full md:w-[312px] h-[390px] object-cover"
              />

              {/* INFO */}
              <div className="bg-white w-full md:w-[312px] h-[108px] px-4 pt-4">
                <p className="text-gray-500 text-[12px]">
                  {inst.position_title}, {program}
                </p>

                <p className="text-red-600 font-bold text-[14px] mt-1">
                  {inst.name}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
