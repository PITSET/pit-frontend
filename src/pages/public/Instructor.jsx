import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../lib/api";
import resolveAssetUrl from "../../lib/resolveAssetUrl";
import { Button } from "../../components/ui/Button";

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
    <div>

      {/* BREADCRUMB */}
      <div className=" py-10">
        <div className="max-w-[1248px] mx-auto px-4 flex items-center gap-3 text-lg font-medium">

          <Link to="/" className="text-gray-700 hover:text-brand-primary">
            Home
          </Link>

          <span className="text-gray-500">›</span>

          <Link to="/about" className="text-gray-700 hover:text-brand-primary">
            About
          </Link>

          <span className="text-brand-primary">›</span>

          <span className="text-brand-primary font-semibold">
            Instructors
          </span>

        </div>
      </div>

      <div className="max-w-[1248px] mx-auto py-16 px-4">

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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 mt-10">
          {error && (
            <div className="col-span-full text-center text-brand-primary">
              {error}
            </div>
          )}

          {loading && !error && (
            <div className="col-span-full text-center text-gray-600">
              Loading...
            </div>
          )}

         {filtered.map((inst) => {
  const program = getPrimaryProgramName(inst);
  const memberId = inst?.id ?? inst?.team_member_id ?? inst?._id;

  return (
    <Link
      key={memberId ?? inst?.id ?? inst?.name}
      to={memberId ? `/instructors/${memberId}` : "/instructors"}
      className="group block w-full md:w-[312px] transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
    >
      {/* IMAGE */}
      <div className="overflow-hidden">
        <img
          src={resolveAssetUrl(inst.image_url)}
          alt={inst.name}
          className="w-full md:w-[312px] h-[390px] object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      {/* INFO */}
      <div className="bg-white w-full md:w-[312px] h-[108px] px-4 pt-4 transition-colors duration-300 group-hover:bg-gray-50">
        <p className="text-gray-500 text-[12px]">
          {inst.position_title}, {program}
        </p>

        <p className="text-brand-primary font-bold text-[14px] mt-1 transition-colors duration-300 group-hover:text-black">
          {inst.name}
        </p>

        <div className="mt-2 text-left">
          <Button variant="link" size="sm" asChild>
            <span className="text-[12px] font-bold">View Profile</span>
          </Button>
        </div>
      </div>
    </Link>
  );
})}
        </div>

      </div>
    </div>
  );
}
