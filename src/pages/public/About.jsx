import React from "react";
import resolveAssetUrl from "../../lib/resolveAssetUrl";
import { motion } from "framer-motion";
import Loader from "../../components/ui/Loader";
import Footer from "../../components/layout/Footer";
import { useAbout } from "../../hooks/useAbout";
import { useFounders } from "../../hooks/useFounders";

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
  const { data: aboutData, isLoading: isAboutLoading } = useAbout();
  const { data: foundersData, isLoading: isFoundersLoading } = useFounders({ enabled: !!aboutData });

  const loading = isAboutLoading || isFoundersLoading || !aboutData || (!foundersData && isFoundersLoading !== false);

  const allowedTypes = ["hero", "history", "mission", "vision"];
  const sections = (aboutData || [])
    .filter((s) => allowedTypes.includes(s.section_type))
    .sort((a, b) => (a.order_position || 0) - (b.order_position || 0));

  const founders = Array.isArray(foundersData) && foundersData.length > 0 ? foundersData : [];

  const getSection = (type) =>
    sections.find((s) => s.section_type === type) || defaultSections[type];

  const whoWeAre = getSection("hero");
  const history = getSection("history");
  const mission = getSection("mission");
  const vision = getSection("vision");
  const displayFounders = founders.length > 0 ? founders : defaultFounders;



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
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full md:w-1/2 flex flex-col justify-center px-10 md:px-16 py-12 bg-white hover:bg-slate-900 transition-colors duration-1000 group"
        >

          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }} className="flex items-center gap-0 mb-8 mt-10">
            <span className="bg-linear-to-r from-brand-primary to-brand-accent text-white text-[13px] font-bold px-5 py-2 tracking-widest uppercase transition-colors duration-1000">
              WHO
            </span>
            <span className="text-gray-700 group-hover:bg-slate-800 group-hover:text-white transition-colors duration-1000 text-[13px] font-bold px-5 py-2 tracking-widest uppercase bg-white/70">
              WE ARE
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }} className="font-[Roboto_Condensed] font-bold text-[52px] md:text-[68px] lg:text-[80px] text-brand-primary group-hover:text-white transition-colors duration-1000 leading-none mb-8">
            {whoWeAre.title}
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.5 }} className="text-gray-600 group-hover:text-gray-300 transition-colors duration-500 text-[15px] md:text-[17px] leading-relaxed max-w-[480px]">
            {whoWeAre.content}
          </motion.p>
        </motion.div>

        {/* RIGHT PANEL — full-height image */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="w-full md:w-1/2 h-64 md:h-full"
        >
          <img
            src={resolveAssetUrl(whoWeAre.image_url)}
            alt="who we are"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </section>

      {/* ─────────────────────────────────────────────
          SECTION 2 · HISTORY
      ───────────────────────────────────────────── */}
      <section id="history" className="relative h-screen snap-start overflow-y-auto flex flex-col md:flex-row">

        {/* LEFT PANEL — full-height image */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full md:w-1/2 h-64 md:h-full"
        >
          <img
            src={resolveAssetUrl(history.image_url)}
            alt="history"
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* RIGHT PANEL — text */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="w-full md:w-1/2 flex flex-col justify-center px-10 md:px-16 py-12 bg-white hover:bg-slate-900 transition-colors duration-500 group"
        >
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }} className="font-[Roboto_Condensed] font-bold text-[52px] md:text-[68px] text-brand-primary group-hover:text-white transition-colors duration-500 leading-none mb-8">
            {history.title}
          </motion.h2>
          {history.content.split("\n\n").map((para, i) => (
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }} key={i} className="text-gray-600 group-hover:text-gray-300 transition-colors duration-500 text-[15px] md:text-[16px] leading-relaxed mb-5">
              {para}
            </motion.p>
          ))}
        </motion.div>
      </section>

      {/* ─────────────────────────────────────────────
          SECTION 3 · MISSION
      ───────────────────────────────────────────── */}
      <section id="mission" className="relative h-screen snap-start overflow-y-auto flex flex-col md:flex-row">

        {/* LEFT PANEL — full-height image */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full md:w-1/2 h-64 md:h-full"
        >
          <img
            src={resolveAssetUrl(mission.image_url)}
            alt="mission"
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* RIGHT PANEL — text with accent bar */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="w-full md:w-1/2 flex flex-col justify-center px-10 md:px-16 py-12 bg-white hover:bg-slate-900 transition-colors duration-500 group"
        >
          <div className="flex items-start gap-5">
            <motion.div initial={{ opacity: 0, scaleY: 0 }} whileInView={{ opacity: 1, scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }} style={{ transformOrigin: "top" }} className="w-[4px] self-stretch bg-linear-to-b from-brand-primary via-brand-accent to-brand-primary shrink-0 rounded-full" />
            <div>
              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }} className="font-[Roboto_Condensed] font-bold text-[52px] md:text-[64px] text-brand-primary group-hover:text-white transition-colors duration-500 leading-none mb-6">
                {mission.title}
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.5 }} className="text-gray-600 group-hover:text-gray-300 transition-colors duration-500 text-[15px] md:text-[17px] leading-relaxed max-w-lg">
                {mission.content}
              </motion.p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─────────────────────────────────────────────
          SECTION 4 · VISION
      ───────────────────────────────────────────── */}
      <section id="vision" className="relative h-screen snap-start overflow-y-auto flex flex-col md:flex-row">

        {/* LEFT PANEL — text with accent bar */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full md:w-1/2 flex flex-col justify-center px-10 md:px-16 py-12 bg-white hover:bg-slate-900 transition-colors duration-500 group order-2 md:order-1"
        >
          <div className="flex items-start gap-5">
            <motion.div initial={{ opacity: 0, scaleY: 0 }} whileInView={{ opacity: 1, scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }} style={{ transformOrigin: "top" }} className="w-[4px] self-stretch bg-linear-to-b from-brand-primary via-brand-accent to-brand-primary shrink-0 rounded-full" />
            <div>
              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }} className="font-[Roboto_Condensed] font-bold text-[52px] md:text-[64px] text-brand-primary group-hover:text-white transition-colors duration-500 leading-none mb-6">
                {vision.title}
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.5 }} className="text-gray-600 group-hover:text-gray-300 transition-colors duration-500 text-[15px] md:text-[17px] leading-relaxed max-w-lg">
                {vision.content}
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* RIGHT PANEL — full-height image */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="w-full md:w-1/2 h-64 md:h-full order-1 md:order-2"
        >
          <img
            src={resolveAssetUrl(vision.image_url)}
            alt="vision"
            className="w-full h-full object-cover"
          />
        </motion.div>
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
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className={`w-full md:w-1/2 h-64 md:h-full ${isReversed ? "order-1 md:order-2" : "order-1"}`}
            >
              <img
                src={resolveAssetUrl(imageUrl)}
                alt={founder.name || "Founder"}
                className="w-full h-full object-cover object-top"
                loading="lazy"
              />
            </motion.div>

            {/* Text Panel */}
            <motion.div
              initial={{ opacity: 0, x: isReversed ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              className={`w-full md:w-1/2 flex flex-col justify-center px-10 md:px-16 py-12 bg-white hover:bg-slate-900 transition-colors duration-500 group ${isReversed ? "order-2 md:order-1" : "order-2"}`}
            >
              {/* Only show "Founders" label on first founder card */}
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }} className="text-brand-accent font-bold text-[13px] tracking-widest uppercase mb-4 transition-colors duration-500">
                Founder
              </motion.p>


              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }} className="font-[Roboto_Condensed] font-bold text-[52px] md:text-[72px] text-brand-primary group-hover:text-white transition-colors duration-500 leading-none mb-6">
                {founder.name}
              </motion.h2>

              {programName && (
                <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.5 }} className="text-gray-400 group-hover:text-gray-300 transition-colors duration-500 text-sm font-medium mb-4 uppercase tracking-wider">
                  {programName}
                </motion.p>
              )}
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.6 }} className="text-gray-600 group-hover:text-gray-300 transition-colors duration-500 text-[15px] md:text-[17px] leading-relaxed max-w-lg">
                {bio}
              </motion.p>
            </motion.div>
          </section>
        );
      })}

      <section className="snap-start py-10 bg-white">
        <Footer />
      </section>

    </div>
  );
}
