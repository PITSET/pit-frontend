import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import logoImage from "../../assets/logo/logo_image.svg";
import api from "../../lib/api";
import resolveAssetUrl from "../../lib/resolveAssetUrl";
import ProjectsCarousel from "../../components/ui/ProjectsCarousel";
import Loader from "../../components/ui/Loader";

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
        const [homeRes, projectsRes, programsRes] = await Promise.all([
          api.get("/home").catch((e) => {
            console.error("Failed to load /api/home:", e);
            return { data: [] };
          }),
          api.get("/projects").catch((e) => {
            console.error("Failed to load /api/projects:", e);
            return { data: [] };
          }),
          api.get("/programs").catch((e) => {
            console.error("Failed to load /api/programs:", e);
            return { data: [] };
          }),
        ]);

        const allPrograms = Array.isArray(programsRes.data)
          ? programsRes.data
          : programsRes.data?.data || programsRes.data?.programs || [];

        const raw = Array.isArray(homeRes.data) ? homeRes.data : homeRes.data?.data || homeRes.data?.home || [];
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

        const rawProjects = Array.isArray(projectsRes.data) ? projectsRes.data : projectsRes.data?.data || projectsRes.data?.projects || [];
        const projectItems = rawProjects
          .filter((item) => item?.is_active !== false)
          .sort((a, b) => (Number(a?.order_position) || 0) - (Number(b?.order_position) || 0))
          .map((item) => {
            let imgVal = item?.image || item?.image_url || item?.cover || item?.cover_url;
            if (!imgVal && item?.images) {
              imgVal = Array.isArray(item.images) ? item.images[0] : item.images;
              if (typeof imgVal === "string" && imgVal.startsWith("[")) {
                try {
                  const parsed = JSON.parse(imgVal);
                  imgVal = Array.isArray(parsed) ? parsed[0] : imgVal;
                } catch (e) {
                  // ignore
                }
              }
            }

            // Resolve program names (handle IDs or Objects)
            const projectPrograms = Array.isArray(item.programs) ? item.programs : [];
            const programNames = projectPrograms
              .map((pOrId) => {
                if (typeof pOrId === "object" && pOrId !== null) {
                  return pOrId.program_name || pOrId.name;
                }
                const found = allPrograms.find((p) => String(p.id) === String(pOrId));
                return found?.program_name || found?.name || null;
              })
              .filter(Boolean);

            // Resolve student count (calculate from linked students only)
            const studentCount = Array.isArray(item.students)
              ? item.students.length
              : 0; // Don't use team_size per user instruction

            return {
              ...item,
              image: resolveAssetUrl(imgVal || ""),
              date: formatProjectDate(
                item?.created_at || item?.updated_at || item?.date || item?.published_at
              ),
              title: item?.name || item?.title || "",
              desc: item?.overview || item?.desc || item?.description || item?.content || "",
              programNames,
              studentCount,
            };
          })
          .filter((item) => item.title || item.desc || item.image);

        setProjects(projectItems);
      } catch (e) {
        console.error("Failed to load data in Home:", e);
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

  if (isLoadingProjects) {
    return <Loader label="Loading Prometheus Institute..." />;
  }

  return (
    <main className="w-full">

      <Helmet>
        <title>Home - Prometheus Institute</title>
        <link rel="icon" type="image/svg+xml" href={logoImage} />
      </Helmet>

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
      <ProjectsCarousel projects={projects} isLoadingProjects={isLoadingProjects} />

    </main>
  );
}
