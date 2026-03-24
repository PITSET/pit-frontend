import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import resolveAssetUrl from "../../lib/resolveAssetUrl";
import Loader from "../../components/ui/Loader";
import Breadcrumbs from "../../components/ui/Breadcrumbs";

const defaultSections = {
  hero: {
    title: "Building Future Innovators",
    content:
      "Prometheus Institute of Technology is committed to delivering practical, future-ready education in technology and innovation. We provide a supportive learning environment that helps students build the skills, critical thinking abilities, and the confidence to succeed in an ever-evolving digital landscape.",
    image_url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
  },
  history: {
    title: "History",
    content:
      "Prometheus Institute of Technology was founded with a clear vision—to create a student learning environment where technology education is practical, relevant and future focused. From the beginning, the institute sought to bridge the gap between traditional academic instruction and the rapidly changing world of technology.\n\nIn its early stages, Prometheus Institute of Technology focused on establishing programs aligned with the needs of local businesses and the surrounding community. The institution worked to develop a curriculum aligned with industry trends, ensuring that students gain exposure to modern tools, technologies, and collaborative learning methods.",
    image_url: "https://images.unsplash.com/photo-1551836022-d5d88e9218df",
  },
  mission: {
    title: "Mission",
    content:
      "To deliver practical, high-quality technology education that builds strong technical skills, creativity, and problem-solving abilities. We aim to prepare students for real-world careers through modern learning processes, innovation, and continuous growth.",
    image_url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
  },
  vision: {
    title: "Vision",
    content:
      "To become a leading modern technology institute that inspires innovation, nurtures talent and empowers students to become confident future technologists. We envision a learning community where creativity meets innovation and all students will make meaningful contributions in a rapidly evolving digital world.",
    image_url: "https://images.unsplash.com/photo-1518770660439-4636190af475",
  },
};

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

export default function About() {
  const [sections, setSections] = useState([]);
  const [founders, setFounders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aboutRes, foundersRes] = await Promise.all([
          api.get("/about"),
          api.get("/team-members/founders").catch(() => null),
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
    /* Scroll-snap container — takes the viewport height */
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory font-roboto">

      {/* ─────────────────────────────────────────────
          SECTION 1 · WHO WE ARE
      ───────────────────────────────────────────── */}
      <section className="relative h-screen snap-start overflow-y-auto flex flex-col md:flex-row">

        {/* LEFT PANEL — text */}
        <div className="relative z-10 w-full md:w-1/2 flex flex-col justify-center px-10 md:px-16 py-12 bg-[#E9E9EB]">
          {/* Breadcrumbs only in first section */}
          <div className="absolute top-4 left-10 md:left-16">
            <Breadcrumbs />
          </div>

          {/* Badge */}
          <div className="flex items-center gap-0 mb-8 mt-10">
            <span className="bg-gradient-to-r from-brand-primary to-brand-accent text-white text-[13px] font-bold px-5 py-2 tracking-widest uppercase">
              WHO
            </span>
            <span className="text-gray-700 text-[13px] font-bold px-5 py-2 tracking-widest uppercase bg-white/70">
              WE ARE
            </span>
          </div>

          <h1 className="font-[Roboto_Condensed] font-bold text-[52px] md:text-[68px] lg:text-[80px] text-brand-primary leading-none mb-8">
            {line1}
            <br />
            {line2}
          </h1>

          <p className="text-gray-600 text-[15px] md:text-[17px] leading-relaxed max-w-[480px]">
            {whoWeAre.content}
          </p>
        </div>

        {/* RIGHT PANEL — full-height image */}
        <div className="w-full md:w-1/2 h-64 md:h-full">
          <img
            src={resolveAssetUrl(whoWeAre.image_url)}
            alt="who we are"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          SECTION 2 · HISTORY
      ───────────────────────────────────────────── */}
      <section id="history" className="relative h-screen snap-start overflow-y-auto flex flex-col md:flex-row">

        {/* LEFT PANEL — full-height image */}
        <div className="w-full md:w-1/2 h-64 md:h-full">
          <img
            src={resolveAssetUrl(history.image_url)}
            alt="history"
            className="w-full h-full object-cover"
          />
        </div>

        {/* RIGHT PANEL — text */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-10 md:px-16 py-12 bg-white">
          <h2 className="font-[Roboto_Condensed] font-bold text-[52px] md:text-[68px] text-brand-primary leading-none mb-8">
            {history.title}
          </h2>
          {history.content.split("\n\n").map((para, i) => (
            <p key={i} className="text-gray-600 text-[15px] md:text-[16px] leading-relaxed mb-5">
              {para}
            </p>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          SECTION 3 · MISSION
      ───────────────────────────────────────────── */}
      <section id="mission" className="relative h-screen snap-start overflow-y-auto flex flex-col md:flex-row">

        {/* LEFT PANEL — full-height image */}
        <div className="w-full md:w-1/2 h-64 md:h-full">
          <img
            src={resolveAssetUrl(mission.image_url)}
            alt="mission"
            className="w-full h-full object-cover"
          />
        </div>

        {/* RIGHT PANEL — text with accent bar */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-10 md:px-16 py-12 bg-[#E9E9EB]">
          <div className="flex items-start gap-5">
            <div className="w-[4px] self-stretch bg-linear-to-b from-brand-primary via-brand-accent to-brand-primary shrink-0 rounded-full" />
            <div>
              <h2 className="font-[Roboto_Condensed] font-bold text-[52px] md:text-[64px] text-brand-primary leading-none mb-6">
                {mission.title}
              </h2>
              <p className="text-gray-600 text-[15px] md:text-[17px] leading-relaxed max-w-lg">
                {mission.content}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          SECTION 4 · VISION
      ───────────────────────────────────────────── */}
      <section id="vision" className="relative h-screen snap-start overflow-y-auto flex flex-col md:flex-row">

        {/* LEFT PANEL — text with accent bar */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-10 md:px-16 py-12 bg-white order-2 md:order-1">
          <div className="flex items-start gap-5">
            <div className="w-[4px] self-stretch bg-linear-to-b from-brand-primary via-brand-accent to-brand-primary shrink-0 rounded-full" />
            <div>
              <h2 className="font-[Roboto_Condensed] font-bold text-[52px] md:text-[64px] text-brand-primary leading-none mb-6">
                {vision.title}
              </h2>
              <p className="text-gray-600 text-[15px] md:text-[17px] leading-relaxed max-w-lg">
                {vision.content}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL — full-height image */}
        <div className="w-full md:w-1/2 h-64 md:h-full order-1 md:order-2">
          <img
            src={resolveAssetUrl(vision.image_url)}
            alt="vision"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          SECTION 5+ · FOUNDERS (one screen per founder)
      ───────────────────────────────────────────── */}
      {displayFounders.slice(0, 2).map((founder, index) => {
        const isReversed = index % 2 === 1;
        const imageUrl =
          founder.profile_image_url ||
          founder.image_url ||
          founder.avatar_url ||
          "";
        const programName =
          founder?.team_member_programs?.[0]?.programs?.program_name || "";
        const bio = founder.bio || founder.description || founder.content || "";

        return (
          <section
            key={founder.id || index}
            className="relative h-screen snap-start overflow-y-auto flex flex-col md:flex-row"
          >
            {/* Image Panel */}
            <div
              className={`w-full md:w-1/2 h-64 md:h-full ${isReversed ? "order-1 md:order-2" : "order-1"}`}
            >
              <img
                src={resolveAssetUrl(imageUrl)}
                alt={founder.name || "Founder"}
                className="w-full h-full object-cover object-top"
                loading="lazy"
              />
            </div>

            {/* Text Panel */}
            <div
              className={`w-full md:w-1/2 flex flex-col justify-center px-10 md:px-16 py-12 bg-[#E9E9EB] ${isReversed ? "order-2 md:order-1" : "order-2"}`}
            >
              {/* Only show "Founders" label on first founder card */}
              <p className="text-brand-accent font-bold text-[13px] tracking-widest uppercase mb-4">
                Founder
              </p>


              <h2 className="font-[Roboto_Condensed] font-bold text-[52px] md:text-[72px] text-brand-primary leading-none mb-6">
                {founder.name}
              </h2>

              {programName && (
                <p className="text-gray-400 text-sm font-medium mb-4 uppercase tracking-wider">
                  {programName}
                </p>
              )}
              <p className="text-gray-600 text-[15px] md:text-[17px] leading-relaxed max-w-lg">
                {bio}
              </p>
            </div>
          </section>
        );
      })}

    </div>
  );
}
