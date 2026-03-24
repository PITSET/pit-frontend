import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import resolveAssetUrl from "../../lib/resolveAssetUrl";
import Loader from "../../components/ui/Loader";
import { Button } from "../../components/ui/Button";
import Breadcrumbs from "../../components/ui/Breadcrumbs";

const TABS = [
  "All",
  "Mechatronics Engineering",
  "Software Engineering",
  "Mechanical Engineering",
];

function getPrimaryProgramName(instructor) {
  const items = instructor?.team_member_programs;
  if (!Array.isArray(items) || items.length === 0) return "";

  const sorted = [...items].sort(
    (a, b) => (a?.order_position ?? 0) - (b?.order_position ?? 0),
  );

  return sorted?.[0]?.programs?.program_name || "";
}

export default function Instructor() {
  const [searchParams] = useSearchParams();
  const [instructors, setInstructors] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const program = (searchParams.get("program") || "").trim();
    if (!program) return;

    const match = TABS.find(
      (t) => t.toLowerCase() === program.toLowerCase(),
    );

    if (match) setActiveTab(match);
  }, [searchParams]);

  // FETCH DATA
  useEffect(() => {
    let isMounted = true;

    api
      .get("/team-members")
      .then((res) => {
        if (!isMounted) return;
        const members = res.data?.data?.data ?? res.data?.data ?? [];

        if (!Array.isArray(members)) {
          throw new Error("Unexpected API response shape for /team-members");
        }

        setInstructors(members.filter((m) => m?.is_instructor));
        setError("");
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load instructors:", err);
        if (!isMounted) return;
        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to load instructors.";
        setError(message);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // FILTER
  const filtered =
    activeTab === "All"
      ? instructors
      : instructors.filter((i) =>
        getPrimaryProgramName(i) === activeTab
      );

  return (
    <div className="bg-white min-h-screen py-12">
      <div className="max-w-[1248px] mx-auto px-6 py-4">
        <Breadcrumbs />
      </div>
      <div className="max-w-[1248px] mx-auto pb-16 px-6">

        {/* TITLE */}
        <h1 className="text-center text-brand-primary font-bold text-[64px] mb-12">
          Instructors
        </h1>

        {/* MOBILE DROPDOWN */}
        <div className="md:hidden mb-8">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="w-full border p-3 rounded"
          >
            {TABS.map((tab) => (
              <option key={tab} value={tab}>
                {tab}
              </option>
            ))}
          </select>
        </div>

        {/* DESKTOP TABS */}
        <div className="hidden md:flex relative w-full h-[67px] bg-[#F8F8FF] border-b-4 border-gray-400">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 relative flex items-center justify-center text-sm font-medium"
            >
              <span
                className={
                  activeTab === tab ? "text-brand-primary" : "text-gray-600"
                }
              >
                {tab}
              </span>

              {activeTab === tab && (
                <span className="absolute bottom-[-4px] left-0 w-full h-[4px] bg-brand-primary"></span>
              )}
            </button>
          ))}
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 mt-10">
          {error && (
            <div className="col-span-full text-center text-brand-primary">
              {error}
            </div>
          )}

          {loading && !error && (
            <div className="col-span-full py-20">
              <Loader label="Loading Instructors..." />
            </div>
          )}

          {isNavigating && (
            <div className="fixed inset-0 z-50">
              <Loader label="Opening Profile..." />
            </div>
          )}

          {filtered.map((inst) => {
            const program = getPrimaryProgramName(inst);
            const memberId = inst?.id ?? inst?.team_member_id ?? inst?._id;

            return (
              <div
                key={memberId ?? inst?.id ?? inst?.name}
                onClick={() => {
                  setIsNavigating(true);
                  navigate(memberId ? `/instructors/${memberId}` : "/instructors");
                }}
                className="group relative bg-[#262626] rounded-[40px] overflow-hidden flex flex-col h-full transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer"
              >
                {/* ── IMAGE ─────────────────────────────── */}
                <div className="relative h-[380px] md:h-[480px] overflow-hidden">
                  <img
                    src={resolveAssetUrl(inst.image_url)}
                    alt={inst.name}
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Hover Cover with Button */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-400 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-white text-[#1A1A1A] px-10 py-4 rounded-full font-bold text-[16px] shadow-2xl transform translate-y-6 group-hover:translate-y-0 transition-all duration-500 ease-out">
                      View Profile
                    </div>
                  </div>

                  {/* Subtle Top Gradient */}
                  <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-black/20 to-transparent pointer-events-none" />
                </div>

                {/* ── INFO (DARK FOOTER) ────────────────── */}
                <div className="p-8 pb-10 flex flex-col items-center text-center bg-[#262626]">
                  <span className="text-[#9FA2A8] text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase block mb-2">
                    INSTRUCTOR
                  </span>
                  <h3 className="text-white text-[28px] sm:text-[32px] md:text-[38px] font-bold tracking-tight leading-none truncate w-full">
                    {inst.name}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
