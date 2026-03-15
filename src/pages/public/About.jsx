import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import resolveAssetUrl from "../../lib/resolveAssetUrl";

const defaultInstructors = [
  {
    id: 1,
    full_name: "John Smith",
    position_title: "Senior Instructor",
    profile_image_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a",
  },
  {
    id: 2,
    full_name: "Sarah Johnson",
    position_title: "Lead Developer",
    profile_image_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2",
  },
  {
    id: 3,
    full_name: "Michael Chen",
    position_title: "Tech Lead",
    profile_image_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
  },
  {
    id: 4,
    full_name: "Emily Davis",
    position_title: "Senior Engineer",
    profile_image_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956",
  },
];

const defaultSections = {
  hero: {
    title: "Building Future Innovators",
    content:
      "Our institute empowers students with knowledge and skills needed in the modern technology world.",
    image_url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
  },
  history: {
    title: "History",
    content:
      "Since our founding, we focus on delivering quality education that bridges academic knowledge with real-world experience.",
    image_url: "https://images.unsplash.com/photo-1551836022-d5d88e9218df",
  },
  mission: {
    title: "Mission",
    content:
      "To deliver practical, high-quality technology education that builds strong technical skills.",
    image_url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
  },
  vision: {
    title: "Vision",
    content:
      "To become a leading modern technology institute that inspires innovation.",
    image_url: "https://images.unsplash.com/photo-1518770660439-4636190af475",
  },
};

export default function About() {
  const [sections, setSections] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aboutRes, programsRes] = await Promise.all([
          api.get("/about"),
          api.get("/programs"),
        ]);

        const allowedTypes = ["hero", "history", "mission", "vision"];

        const aboutSections = (aboutRes.data?.data || [])
          .filter((s) => allowedTypes.includes(s.section_type))
          .sort((a, b) => (a.order_position || 0) - (b.order_position || 0));

        setSections(aboutSections);

        const programs = programsRes.data?.data || [];

        const instructorPromises = programs.map((program) =>
          api
            .get(`/programs/${program.id}/instructors`)
            .then((res) => res.data?.data || [])
            .catch(() => []),
        );

        const instructorsByProgram = await Promise.all(instructorPromises);

        const allInstructors = [];
        const seen = new Set();

        instructorsByProgram.flat().forEach((inst) => {
          const key = inst.id || `${inst.full_name}-${inst.email}`;
          if (!seen.has(key)) {
            seen.add(key);
            allInstructors.push(inst);
          }
        });

        setInstructors(allInstructors);
      } catch (err) {
        console.log("About page fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getSection = (type) =>
    sections.find((s) => s.section_type === type) || defaultSections[type];

  const displayInstructors = instructors.length > 0 ? instructors : defaultInstructors;
  const whoWeAre = getSection("hero");
  const history = getSection("history");
  const mission = getSection("mission");
  const vision = getSection("vision");

  const titleParts = whoWeAre.title.split(" ");
  const line1 = titleParts[0];
  const line2 = titleParts.slice(1).join(" ");

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[40vh]">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-[#E9E9EB] py-0 px-4 md:px-0 font-roboto">
      <div className="max-w-[1248px] mx-auto">

        {/* WHO WE ARE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          <div>

            <div className="flex items-center gap-3 mb-4">
              <span className="bg-gradient-to-r from-[#FB1E28] to-[#FF8950] text-white text-[24px] font-bold px-6 py-2 rounded-l-[8px]">
                WHO
              </span>

              <span className="text-gray-700 text-[24px] font-bold">
                WE ARE
              </span>
            </div>

            <h1 className="text-[64px] font-bold text-red-600 leading-none">
              {line1}
            </h1>

            <h1 className="text-[64px] font-bold text-red-600 mb-6 leading-none">
              {line2}
            </h1>

            <p className="text-gray-600 leading-relaxed">
              {whoWeAre.content}
            </p>

          </div>

          <div className="flex justify-center md:justify-end">
            <img
              src={resolveAssetUrl(whoWeAre.image_url)}
              alt="who we are"
              className="w-[633px] h-[686px] object-cover"
            />
          </div>

        </div>
{/* HISTORY */}
<div className="max-w-[950px] mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-1 mt-[300px]">

  {/* IMAGE */}
  <div className="flex justify-center md:justify-start">
    <img
      src={resolveAssetUrl(history.image_url)}
      alt="history"
      className="w-[400px] h-[400px] object-cover rounded-xl"
    />
  </div>

  {/* TEXT */}
  <div className="max-w-[480px]">

    <h2 className="font-roboto-condensed font-bold text-[56px] text-[#D32F2F] mb-4">
      {history.title}
    </h2>

    <p className="text-gray-600 text-[16px] leading-relaxed">
      {history.content}
    </p>

  </div>

</div>
        {/* MISSION (UNCHANGED) */}
        <div className="mx-0 grid grid-cols-1 md:grid-cols-2 items-center gap-10 mt-[330px]">

          <div className="flex justify-center md:justify-end">
            <img
              src={resolveAssetUrl(mission.image_url)}
              alt="mission"
              className="w-[400px] h-[400px] object-cover rounded-[16px]"
            />
          </div>

          <div className="flex items-start gap-6">

            <div className="w-[3px] h-[137px] bg-gradient-to-b from-[#FD1722] via-[#FF884D] to-[#76191F]" />

            <div>

              <h2 className="font-roboto-condensed font-bold text-[40px] text-[#FD1722] mb-3">
                {mission.title}
              </h2>

              <p className="font-roboto text-[16px] text-gray-600 max-w-md leading-relaxed">
                {mission.content}
              </p>

            </div>

          </div>

        </div>

   {/* VISION */}
<div className="mx-4 md:mx-16 lg:mx-32 grid grid-cols-1 md:grid-cols-2 items-center gap-10 mt-[120px] md:mt-[50px]">

{/* TEXT SECTION */}
<div className="flex items-start gap-6">

  {/* Text */}
  <div className="flex flex-col">

    <h2 className="font-roboto-condensed font-bold text-[28px] md:text-[40px] text-[#FD1722] mb-3 md:ml-20">
      {vision.title}
    </h2>

    <p className="font-roboto text-[16px] text-gray-600 max-w-md leading-relaxed md:ml-20">
      {vision.content}
    </p>

  </div>

  {/* Gradient Line */}
  <div className="w-[3px] h-[137px] bg-gradient-to-b from-[#FD1722] via-[#FF884D] to-[#76191F]" />

</div>

{/* IMAGE SECTION */}
<div className="flex justify-center md:justify-start">
  <img
    src={resolveAssetUrl(vision.image_url)}
    alt="vision"
    className="w-[400px] h-[400px] object-cover rounded-[16px]"
  />
</div>

</div>

        {/* INSTRUCTORS */}
        <div className="mt-24">

          <h2 className="font-roboto-condensed font-bold text-[64px] text-[#D32F2F] mb-8">
            Instructors
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 mt-10">
            {displayInstructors.map((inst, i) => {
              const program =
                inst?.team_member_programs?.[0]?.programs?.program_name || "";
              const name = inst?.full_name ?? inst?.name ?? "Instructor";
              const imageUrl =
                inst?.profile_image_url ?? inst?.image_url ?? "";
              const memberId = inst?.id ?? inst?.team_member_id ?? inst?._id;

              return (
                <Link
                  key={memberId ?? `${name}-${i}`}
                  to={memberId ? `/instructors/${memberId}` : "/instructors"}
                  className="group w-full md:w-[312px] transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer"
                >
                  {/* IMAGE */}
                  <div className="overflow-hidden">
                    <img
                      src={resolveAssetUrl(imageUrl)}
                      alt={name}
                      className="w-full md:w-[312px] h-[390px] object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>

                  {/* INFO */}
                  <div className="bg-white w-full md:w-[312px] h-[108px] px-4 pt-4 transition-colors duration-300 group-hover:bg-gray-50">
                    <p className="text-gray-500 text-[12px]">
                      {inst?.position_title}
                      {program ? `, ${program}` : ""}
                    </p>

                    <p className="text-red-600 font-bold text-[14px] mt-1 transition-colors duration-300 group-hover:text-black">
                      {name}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
}
