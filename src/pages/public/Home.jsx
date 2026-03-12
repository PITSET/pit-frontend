import React, { useEffect, useState } from "react";
import api from "../../lib/api";
import resolveAssetUrl from "../../lib/resolveAssetUrl";

const normalizeSectionType = (value) => String(value || "").trim().toLowerCase();

const toTime = (value) => {
  const date = value instanceof Date ? value : new Date(typeof value === "string" ? value : "");
  const time = date.getTime();
  return Number.isNaN(time) ? 0 : time;
};

const pickOne = (items, strategy) => {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) return null;

  if (strategy === "lowest_order_position") {
    return [...list].sort((a, b) => {
      const orderDiff = (Number(a?.order_position) || 0) - (Number(b?.order_position) || 0);
      if (orderDiff !== 0) return orderDiff;
      return toTime(b?.updated_at || b?.created_at) - toTime(a?.updated_at || a?.created_at);
    })[0];
  }

  // "latest_updated"
  return [...list].sort(
    (a, b) => toTime(b?.updated_at || b?.created_at) - toTime(a?.updated_at || a?.created_at),
  )[0];
};

const formatProjectDate = (value) => {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(typeof value === "string" ? value : String(value));

  if (Number.isNaN(date.getTime())) return "";

  const formatted = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);

  return formatted.toUpperCase();
};

export default function Home() {

  const [heroSection, setHeroSection] = useState(null);
  const [aboutSection, setAboutSection] = useState(null);
  const [programSection, setProgramSection] = useState(null);
  const [founder1Section, setFounder1Section] = useState(null);
  const [founder2Section, setFounder2Section] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      setIsLoadingProjects(true);
      try {
        const res = await api.get("/home");

        const raw = Array.isArray(res.data) ? res.data : res.data?.data || res.data?.home || [];
        const activeItems = (Array.isArray(raw) ? raw : []).filter((item) => item?.is_active === true);
        const sortedItems = [...activeItems].sort(
          (a, b) => (Number(a?.order_position) || 0) - (Number(b?.order_position) || 0),
        );

        const heroes = sortedItems.filter(
          (item) => normalizeSectionType(item?.section_type) === "hero",
        );
        const abouts = sortedItems.filter(
          (item) => normalizeSectionType(item?.section_type) === "about",
        );
        const programs = sortedItems.filter(
          (item) => normalizeSectionType(item?.section_type) === "program",
        );
        const founders = sortedItems.filter((item) =>
          normalizeSectionType(item?.section_type).startsWith("founder"),
        );

        const hero = pickOne(heroes, "latest_updated");
        const about = pickOne(abouts, "lowest_order_position");
        const program = pickOne(programs, "lowest_order_position");

        const founder1 =
          pickOne(
            founders.filter((item) => normalizeSectionType(item?.section_type) === "founder1"),
            "lowest_order_position",
          ) ||
          founders[0] ||
          null;
        const founder2 =
          pickOne(
            founders.filter((item) => normalizeSectionType(item?.section_type) === "founder2"),
            "lowest_order_position",
          ) ||
          founders[1] ||
          null;

        if (!isActive) return;
        setHeroSection(hero);
        setAboutSection(about);
        setProgramSection(program);
        setFounder1Section(founder1);
        setFounder2Section(founder2);

        const projectItems = (Array.isArray(raw) ? raw : [])
          .filter((item) => item?.is_active === true)
          .filter((item) => normalizeSectionType(item?.section_type) === "project")
          .sort((a, b) => (Number(a?.order_position) || 0) - (Number(b?.order_position) || 0))
          .map((item) => ({
            image: resolveAssetUrl(item?.image || item?.image_url || item?.cover || item?.cover_url || ""),
            date: formatProjectDate(
              item?.date || item?.published_at || item?.updated_at || item?.created_at,
            ),
            title: item?.title || item?.name || "",
            desc: item?.desc || item?.description || item?.content || "",
          }))
          .filter((item) => item.title || item.desc || item.image);

        setProjects(projectItems);
      } catch (e) {
        console.error("Failed to load /api/home projects:", e);
        if (!isActive) return;
        setHeroSection(null);
        setAboutSection(null);
        setProgramSection(null);
        setFounder1Section(null);
        setFounder2Section(null);
        setProjects([]);
      }

      if (!isActive) return;
      setIsLoadingProjects(false);
    };

    load();

    return () => {
      isActive = false;
    };
  }, []);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!projects.length) {
      setIndex(0);
      return;
    }

    setIndex((current) => (current >= projects.length ? 0 : current));
  }, [projects]);

  const nextProject = () => {
    if (!projects.length) return;
    setIndex((index + 1) % projects.length);
  };

  const prevProject = () => {
    if (!projects.length) return;
    setIndex((index - 1 + projects.length) % projects.length);
  };

  return (
    <main className="w-full">

{/* HERO */}
<section className="relative min-h-[90vh] md:min-h-[95vh] w-full flex items-center">

<div
className="absolute inset-0 bg-cover bg-center"
style={{
backgroundImage: `url('${resolveAssetUrl(heroSection?.image_url)}')`,
}}
/>

<div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>

<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 w-full">

<div className="max-w-xl md:max-w-2xl text-white">

<h1 className="font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight mb-6">
{heroSection?.title || (
<>
Empowering Future <br /> Technologists
</>
)}
</h1>

<p className="text-sm md:text-base text-gray-200 mb-8">
{heroSection?.content ||
"Through practical education and innovative programs, we prepare students to meet real-world challenges and lead in a rapidly evolving technological landscape."}
</p>

<button className="bg-red-600 text-white hover:bg-white hover:text-red-600 transition px-6 py-3 rounded-md font-semibold shadow-lg">
Explore Our Programs →
</button>

</div>
</div>

</section>


{/* ABOUT SECTION */}
<section className="relative min-h-[90vh] md:min-h-[95vh] w-full flex items-center">

<div
className="absolute inset-0 bg-cover bg-center"
style={{
backgroundImage: `url('${resolveAssetUrl(aboutSection?.image_url)}')`,
}}
/>

<div className="absolute inset-0 bg-black/50"></div>

<div className="relative max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-12 flex justify-end">

<div className="max-w-md text-white">

<h2 className="font-bold text-3xl md:text-5xl mb-4">
{aboutSection?.title || "About Us"}
</h2>

<p className="text-sm md:text-base text-gray-200 mb-6 leading-relaxed">
{aboutSection?.content ||
"Prometheus Institute of Technology is dedicated to providing quality technology education that builds strong foundations, practical skills, and innovative thinking for future professionals."}
</p>

<button className="border border-white px-6 py-3 rounded-md text-white transition hover:bg-red-600 hover:border-red-600">
DISCOVER OUR MISSION →
</button>

</div>
</div>

</section>


<section className="w-full bg-gray-100 py-16 md:py-24">

<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

<div>
<img
src={resolveAssetUrl(founder1Section?.image_url)}
alt={founder1Section?.title || "Founder"}
className="w-full max-w-[520px] h-[380px] md:h-[620px] object-cover rounded-lg"
/>
</div>

<div>

<p className="font-bold text-lg text-red-600 mb-3">
FOUNDER & PRINCIPAL
</p>

<h2 className="font-bold text-3xl md:text-5xl lg:text-6xl text-gray-900 mb-6">
{founder1Section?.title || "Sheenaymu"}
</h2>

<p className="text-gray-600 leading-relaxed">
{founder1Section?.content ||
"At Prometheus Institute of Technology, our mission is to create a clear pathway for students to succeed in the world of technology."}
</p>

</div>

</div>

</section>


{/* FOUNDER SECTION 2 */}
<section className="w-full bg-gray-100 py-24">

<div className="max-w-7xl mx-auto px-6 lg:px-12 grid md:grid-cols-2 gap-16 items-center">

<div>

<p className="font-bold text-[24px] text-red-600 mb-3">
FOUNDER & PRINCIPAL
</p>

<h2 className="font-bold text-[64px] text-gray-900 mb-6">
{founder2Section?.title || "LeyKler"}
</h2>

<p className="text-[16px] text-gray-600 leading-relaxed">
{founder2Section?.content ||
  "We believe education should ignite curiosity, creativity and confidence for the next generation of technologists."}
</p>

</div>

<div className="flex justify-end">
<img
src={resolveAssetUrl(founder2Section?.image_url)}
alt={founder2Section?.title || "LeyKler"}
className="w-[580px] h-[720px] object-cover"
/>
</div>

</div>

</section>


<section className="relative w-full min-h-[90vh] md:min-h-[95vh] flex items-center">

{/* Background Image */}
<div
className="absolute inset-0 bg-cover bg-center"
style={{
backgroundImage: `url('${resolveAssetUrl(programSection?.image_url)}')`,
}}
/>

{/* Overlay */}
<div className="absolute inset-0 bg-black/40"></div>

{/* Content */}
<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 w-full">

<div className="max-w-md text-white">

<h2 className="font-bold text-3xl md:text-5xl mb-4">
{programSection?.title || "Programs"}
</h2>

<p className="text-sm md:text-base text-gray-200 mb-6">
{programSection?.content ||
"Our programs are designed to provide strong technical foundations, practical skills, and industry-relevant knowledge to prepare students for future careers in technology."}
</p>

<button className="text-sm md:text-base bg-red-600 text-white px-6 py-3 rounded-md border border-red-600 hover:bg-white hover:text-red-600 transition">
VIEW ALL PROGRAMS →
</button>

</div>

</div>

</section>

{/* PROJECTS */}
<section className="py-24 bg-gray-200">

<div className="max-w-6xl mx-auto px-6">

<h2 className="text-center font-bold text-[48px] mb-14">
Projects
</h2>

<div className="flex justify-center">

<div className="relative bg-[#f3f3f5] w-[650px] h-[320px] rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.15)] flex items-center px-12 gap-10">

{/* IMAGE */}
<img
src={projects[index]?.image || ""}
alt="project"
className="w-[200px] h-[200px] object-cover rounded-xl shadow-md"
/>

{/* TEXT */}
<div>

<p className="text-sm text-gray-500">
{isLoadingProjects ? "" : projects[index]?.date || ""}
</p>

<h3 className="font-bold text-xl mt-1">
{isLoadingProjects ? "" : projects[index]?.title || ""}
</h3>

<p className="text-gray-600 text-sm mt-2 max-w-[260px]">
{isLoadingProjects ? "" : projects[index]?.desc || ""}
</p>

<button className="mt-4 bg-black text-white border border-black text-sm px-5 py-2 rounded-md transition duration-300 hover:bg-white hover:text-black">
Read More
</button>

<div className="flex gap-2 mt-6">
{projects.map((_,i)=>(
<span
key={i}
className={`h-2 rounded-full ${
i===index ? "bg-red-500 w-6" : "bg-gray-400 w-2"
}`}
></span>
))}
</div>

</div>

{/* ARROWS */}
<div className="absolute bottom-6 right-8 flex gap-4">

<button
onClick={prevProject}
disabled={!projects.length}
className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-red-500 text-lg transition hover:bg-red-500 hover:text-white"
>
←
</button>

<button
onClick={nextProject}
disabled={!projects.length}
className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-red-500 text-lg transition hover:bg-red-500 hover:text-white"
>
→
</button>

</div>

</div>

</div>

{/* VIEW ALL PROJECTS BUTTON */}
<div className="flex justify-center mt-14">
<button className="border border-red-500 text-red-500 px-8 py-3 rounded-md font-semibold transition hover:bg-red-500 hover:text-white">
VIEW ALL PROJECTS →
</button>
</div>

</div>

</section>

</main>
);
}
