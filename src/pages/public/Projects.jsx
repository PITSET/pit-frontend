import React, { useEffect, useState } from "react";
import api from "../../lib/api";
import resolveAssetUrl from "../../lib/resolveAssetUrl";
import ProjectsCollection from "../../components/ui/ProjectsCollection";

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
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    let isActive = true;

    const fetchProjects = async () => {
      setLoading(true);
      try {
        const res = await api.get("/projects");
        const raw = Array.isArray(res.data) ? res.data : res.data?.data || res.data?.projects || [];
        
        const mapped = (Array.isArray(raw) ? raw : [])
          .filter((p) => p.is_active !== false)
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

            return {
              id: item.id,
              title: item.name || item.title || "",
              desc: item.overview || item.desc || item.description || "",
              image: resolveAssetUrl(imgVal || ""),
              programs: item.programs || [],
              date: formatProjectDate(item.created_at || item.date),
              team_size: item.team_size || item.members_count || null,
            };
          });

        if (isActive) {
          setProjects(mapped);
        }
      } catch (err) {
        console.error("Failed to load projects:", err);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchProjects();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-white pb-20 pt-10">
      <ProjectsCollection projects={projects} isLoading={loading} />
    </div>
  );
}
