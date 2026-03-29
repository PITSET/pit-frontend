import React, { useEffect } from "react";
import { useProjects } from "../../hooks/useProjects";
import resolveAssetUrl from "../../lib/resolveAssetUrl";
import ProjectsCollection from "../../components/ui/ProjectsCollection";
import Footer from "../../components/layout/Footer";
const formatProjectDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
};

export default function Projects() {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const { data: rawProjects, isLoading: loading } = useProjects();

  const projects = (rawProjects || []).map((item) => {
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

    return {
      id: item.id,
      title: item.name || item.title || "",
      desc: item.overview || item.desc || item.description || "",
      image: resolveAssetUrl(imgVal || ""),
      programs: item.programs || [],
      date: formatProjectDate(item.created_at || item.date),
      students: item.students || [],
    };
  });

  return (
    <div className="h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth bg-white">
      
      {/* SECTION 1: PROJECTS COLLECTION */}
      <section className="min-h-screen snap-start pt-12 pb-20 px-8">
        <div className="w-full">
          <ProjectsCollection projects={projects} isLoading={loading} />
        </div>
      </section>

      {/* SECTION 2: FOOTER */}
      <section className="snap-start py-10 bg-white">
        <Footer />
      </section>

    </div>
  );
}
