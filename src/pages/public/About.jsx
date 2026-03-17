import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import resolveAssetUrl from "../../lib/resolveAssetUrl";
import Loader from "../../components/ui/Loader";

const defaultFounders = [
  {
    id: 1,
    name: "Sheenyamu",
    role: "Founder & Principal",
    bio: "At Prometheus Institute of Technology, our mission is to create a clear pathway for students to succeed in the world of technology. We are committed to equipping learners with strong foundations, practical skills, and the confidence needed to thrive in today's fast-changing digital landscape.",
    image_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a",
  },
  {
    id: 2,
    name: "LeyKler",
    role: "Founder & Principal",
    bio: "At Prometheus Institute of Technology, we believe education should do more than transfer knowledge—it should ignite curiosity, creativity, and confidence. Our vision is to build an institute where technology education is practical, relevant, and aligned with the needs of the future.",
    image_url: "https://images.unsplash.com/photo-1527980965255-d3b416303d12",
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
  const [founders, setFounders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aboutRes, foundersRes] = await Promise.all([
          api.get("/about"),
          api.get("/founders").catch(() => null),
        ]);

        const allowedTypes = ["hero", "history", "mission", "vision"];

        const aboutSections = (aboutRes.data?.data || [])
          .filter((s) => allowedTypes.includes(s.section_type))
          .sort((a, b) => (a.order_position || 0) - (b.order_position || 0));

        setSections(aboutSections);

        const foundersData = foundersRes?.data?.data || foundersRes?.data || [];
        if (Array.isArray(foundersData) && foundersData.length > 0) {
          setFounders(foundersData);
        }
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

  const whoWeAre = getSection("hero");
  const history = getSection("history");
  const mission = getSection("mission");
  const vision = getSection("vision");
  const displayFounders = founders.length > 0 ? founders : defaultFounders;

  const titleParts = whoWeAre.title.split(" ");
  const line1 = titleParts[0];
  const line2 = titleParts.slice(1).join(" ");

  if (loading) {
    return <Loader label="Loading About..." />;
  }

  return (
    <div className="bg-[#E9E9EB] py-0 px-4 md:px-0 pb-16 md:pb-10 font-roboto">
      <div className="max-w-[1248px] mx-auto">

        {/* WHO WE ARE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          <div>

            <div className="flex items-center gap-3 mb-4">
              <span className="bg-gradient-to-r from-brand-primary to-brand-accent text-white text-[24px] font-bold px-6 py-2 rounded-l-[8px]">
                WHO
              </span>

              <span className="text-gray-700 text-[24px] font-bold">
                WE ARE
              </span>
            </div>

            <h1 className="text-[64px] font-bold text-brand-primary leading-none">
              {line1}
            </h1>

            <h1 className="text-[64px] font-bold text-brand-primary mb-6 leading-none">
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

    <h2 className="font-roboto-condensed font-bold text-[56px] text-brand-primary mb-4">
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

            <div className="w-[3px] h-[137px] bg-gradient-to-b from-brand-primary via-brand-accent to-brand-primary-dark" />

            <div>

              <h2 className="font-roboto-condensed font-bold text-[40px] text-brand-primary mb-3">
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

    <h2 className="font-roboto-condensed font-bold text-[28px] md:text-[40px] text-brand-primary mb-3 md:ml-20">
      {vision.title}
    </h2>

    <p className="font-roboto text-[16px] text-gray-600 max-w-md leading-relaxed md:ml-20">
      {vision.content}
    </p>

  </div>

  {/* Gradient Line */}
  <div className="w-[3px] h-[137px] bg-linear-to-b from-brand-primary via-brand-accent to-brand-primary-dark" />

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

      

        {/* FOUNDERS */}
        <div className="mt-24 md:mt-32">
          <div className="flex items-center gap-3 mb-10">
            <span className="bg-gradient-to-r from-brand-primary to-brand-accent text-white text-[18px] md:text-[20px] font-bold px-5 py-2 rounded-l-[8px]">
              FOUNDER
            </span>
            <span className="text-gray-700 text-[18px] md:text-[20px] font-bold">
              & PRINCIPAL
            </span>
          </div>

          <div className="space-y-16 md:space-y-24">
            {displayFounders.slice(0, 2).map((founder, index) => {
              const isReversed = index % 2 === 1;
              const imageUrl =
                founder.profile_image_url ||
                founder.image_url ||
                founder.avatar_url ||
                "";
              const programName =
                founder?.team_member_programs?.[0]?.programs?.program_name || "";
              const role = founder.position_title || founder.role || "Founder & Principal";
              const bio = founder.bio || founder.description || founder.content || "";

              return (
                <div
                  key={founder.id || founder.name || index}
                  className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start"
                >
                  <div
                    className={
                      isReversed
                        ? "md:order-2 flex justify-center md:justify-end"
                        : "flex justify-center md:justify-start"
                    }
                  >
                    <div className="w-full max-w-[520px] overflow-hidden rounded-[16px] bg-gray-100 aspect-[4/3] md:aspect-[3/4]">
                      <img
                        src={resolveAssetUrl(imageUrl)}
                        alt={founder.name || "Founder"}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  <div className={isReversed ? "md:order-1" : ""}>
                    <p className="text-[12px] tracking-[0.2em] font-bold text-red-500 mb-3">
                      {String(role).toUpperCase()}
                    </p>
                    <h3 className="text-[44px] md:text-[56px] font-bold text-brand-primary leading-none mb-6">
                      {founder.name}
                    </h3>
                    {programName && (
                      <p className="text-gray-500 text-sm font-medium mb-4">
                        {programName}
                      </p>
                    )}
                    <p className="text-gray-600 leading-relaxed max-w-xl">
                      {bio}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        </div>

    </div>
  );
}
