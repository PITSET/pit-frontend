
import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import logoImage from "../../assets/logo/logo_image.svg";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";

import api from "../../lib/api";
import resolveAssetUrl from "../../lib/resolveAssetUrl";
import ProjectsCarousel from "../../components/ui/ProjectsCarousel";
import Loader from "../../components/ui/Loader";
import { Button } from "../../components/ui/Button";
import Footer from "../../components/layout/Footer";

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

const getYoutubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export default function Home() {

  const { scrollYProgress } = useScroll();
  const titleX = useTransform(scrollYProgress, [0, 0.2], [0, -100]);

  const [heroSection, setHeroSection] = useState(null);
  const [aboutSection, setAboutSection] = useState(null);
  const [programSection, setProgramSection] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      setIsLoadingProjects(true);
      try {
        const [homeRes, projectsRes, programsRes, aboutRes] = await Promise.all([
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
          api.get("/about").catch((e) => {
            console.error("Failed to load /api/about:", e);
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
        // 1. gete all active items from the about endpoint
        const aboutRaw = Array.isArray(aboutRes.data) ? aboutRes.data : aboutRes.data?.data || [];
        const activeAboutItems = (Array.isArray(aboutRaw) ? aboutRaw : []).filter((item) => item?.is_active === true);
        // 2. filter out the items that are not about
        const filterAbouts = activeAboutItems.filter((item) => normalizeSectionType(item?.section_type) === "about");

        const heroes = sortedItems.filter(
          (item) => normalizeSectionType(item?.section_type) === "hero",
        );
        const aboutsFromHome = sortedItems.filter(
          (item) => normalizeSectionType(item?.section_type) === "about",
        );
        const programs = sortedItems.filter(
          (item) => normalizeSectionType(item?.section_type) === "program",
        );

        const hero = pickOne(heroes, "latest_updated");
        const about = pickOne(aboutsFromHome, "lowest_order_position") || pickOne(filterAbouts, "lowest_order_position") || pickOne(activeAboutItems, "lowest_order_position");
        const program = pickOne(programs, "lowest_order_position");

        if (!isActive) return;
        setHeroSection(hero);
        setAboutSection(about);
        setProgramSection(program);

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

  if (isNavigating) {
    return <Loader label="Opening Programs..." />;
  }

  return (
    <main className="w-full h-[calc(100dvh-90px)] overflow-y-auto overflow-x-hidden snap-y snap-mandatory scroll-smooth relative">

      <Helmet>
        <title>Home - Prometheus Institute</title>
        <link rel="icon" type="image/svg+xml" href={logoImage} />
      </Helmet>

      {/* HERO */}
      <section className="relative w-full min-h-[calc(100dvh-90px)] flex items-center justify-center snap-start overflow-hidden shrink-0">

        {/* Background Image (Fallback or Overlay while loading) */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: heroSection?.image_url ? `url('${resolveAssetUrl(heroSection.image_url)}')` : "none",
          }}
        />

        {/* YouTube Video Background */}
        {heroSection?.video_url && (
          <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
            <iframe
              className="absolute top-1/2 left-1/2 w-full h-[56.25vw] min-h-screen min-w-[177.77vh] transform -translate-x-1/2 -translate-y-1/2 scale-110"
              src={`https://www.youtube.com/embed/${getYoutubeId(heroSection.video_url)}?autoplay=1&mute=1&controls=0&loop=1&playlist=${getYoutubeId(heroSection.video_url)}&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&disablekb=1`}
              frameBorder="0"
              allow="autoplay; encrypted-media"
            />
          </div>
        )}

        <div className="absolute inset-0 bg-black/40 md:bg-linear-to-r md:from-black/70 md:via-black/40 md:to-transparent z-10"></div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 w-full flex justify-center lg:justify-center">

          <div className="max-w-xl md:max-w-2xl text-white text-center lg:text-left">

            <motion.h1 
              style={{ x: titleX }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight mb-6"
            >
              {heroSection?.title || (
                <>
                  Empowering Future <br /> Technologists
                </>
              )}
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              className="text-sm md:text-base text-gray-200 mb-8"
            >
              {heroSection?.content ||
                "Through practical education and innovative programs, we prepare students to meet real-world challenges and lead in a rapidly evolving technological landscape."}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
            >
              <Button
                variant="primary"
                size="lg"
                className="font-semibold shadow-lg"
                onClick={() => {
                  setIsNavigating(true);
                  navigate("/programs");
                }}
              >
                Explore Our Programs
              </Button>
            </motion.div>

          </div >
        </div >

      </section >


      {/* ABOUT SECTION */}
      <section className="relative w-full min-h-[calc(100dvh-90px)] flex items-center justify-center snap-start overflow-hidden shrink-0" >

        <div
          className="absolute inset-0 bg-cover bg-top"
          style={{
            backgroundImage: aboutSection?.image_url ? `url('${resolveAssetUrl(aboutSection.image_url)}')` : "none",
          }}
        />

        {/* YouTube Video Background */}
        {aboutSection?.video_url && (
          <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
            <iframe
              className="absolute top-1/2 left-1/2 w-full h-[56.25vw] min-h-screen min-w-[177.77vh] transform -translate-x-1/2 -translate-y-1/2 scale-110"
              src={`https://www.youtube.com/embed/${getYoutubeId(aboutSection.video_url)}?autoplay=1&mute=1&controls=0&loop=1&playlist=${getYoutubeId(aboutSection.video_url)}&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&disablekb=1`}
              frameBorder="0"
              allow="autoplay; encrypted-media"
            />
          </div>
        )}

        <div className="absolute inset-0 bg-black/50 z-10"></div>

        <div className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-12 flex justify-center lg:justify-center">

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-md text-white text-center lg:text-left"
          >

            <h2 className="font-bold text-3xl md:text-5xl mb-4">
              {aboutSection?.title || "About Us"}
            </h2>

            <p className="text-sm md:text-base text-gray-200 mb-6 leading-relaxed">
              {aboutSection?.content ||
                "Prometheus Institute of Technology is dedicated to providing quality technology education that builds strong foundations, practical skills, and innovative thinking for future professionals."}
            </p>

            <Button
              asChild
              variant="secondary"
              size="lg"
              className="font-semibold shadow-lg"
            >
              <Link to="/about">
                DISCOVER OUR MISSION
              </Link>
            </Button>

          </motion.div >
        </div >

      </section >


      {/* PROGRAMS */}
      <section className="relative w-full min-h-[calc(100dvh-90px)] flex items-center justify-center snap-start overflow-hidden shrink-0">

        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: programSection?.image_url ? `url('${resolveAssetUrl(programSection.image_url)}')` : "none",
          }}
        />

        {/* YouTube Video Background */}
        {programSection?.video_url && (
          <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
            <iframe
              className="absolute top-1/2 left-1/2 w-full h-[56.25vw] min-h-screen min-w-[177.77vh] transform -translate-x-1/2 -translate-y-1/2 scale-110"
              src={`https://www.youtube.com/embed/${getYoutubeId(programSection.video_url)}?autoplay=1&mute=1&controls=0&loop=1&playlist=${getYoutubeId(programSection.video_url)}&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&disablekb=1`}
              frameBorder="0"
              allow="autoplay; encrypted-media"
            />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 z-10"></div>

        {/* Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 w-full flex justify-center lg:justify-center">

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-md text-white text-center lg:text-left"
          >

            <h2 className="font-bold text-3xl md:text-5xl mb-4">
              {programSection?.title || "Programs"}
            </h2>

            <p className="text-sm md:text-base text-gray-200 mb-6">
              {programSection?.content ||
                "Our programs are designed to provide strong technical foundations, practical skills, and industry-relevant knowledge to prepare students for future careers in technology."}
            </p>

            <Button asChild variant="primary" size="lg">
              <Link to="/programs">VIEW ALL PROGRAMS</Link>
            </Button>

          </motion.div >

        </div >

      </section >

      {/* PROJECTS */}
      <section className="relative w-full min-h-[calc(100dvh-90px)] flex items-center justify-center snap-start overflow-hidden shrink-0">
        <ProjectsCarousel projects={projects} isLoadingProjects={isLoadingProjects} />
      </section>
      <section className="snap-start pt-[90px]">
        <Footer />
      </section>
    </main>
  );
}
