import React, { useState, useEffect } from "react";
import api from "../../lib/api";

const instructors = [
  {
    name: "Dr. Ko Ko Zaw",
    field: "Instructor, Mechanical Engineering",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
  },
  {
    name: "Ms. Hnin Pwint",
    field: "Instructor, Mechanical Engineering",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
  },
  {
    name: "Mr. Di Soe",
    field: "Instructor, Software Engineering",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
  },
  {
    name: "Mr. Thiri Aung",
    field: "Instructor, Software Engineering",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
  },
  {
    name: "Mr. Min Htet",
    field: "Instructor, Mechatronics Engineering",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
  },
  {
    name: "Mr. Aung Kyaw Lin",
    field: "Instructor, Mechatronics Engineering",
    image: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79",
  },
];

const defaultSections = {
  who_we_are: {
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const res = await api.get("/about");
        setSections(res.data.data || []);
      } catch (err) {
        console.log("About fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAbout();
  }, []);

  const getSection = (type) =>
    sections.find((s) => s.section_type === type) || defaultSections[type];

  const whoWeAre = getSection("who_we_are");
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
    <div className="bg-[#E9E9EB] py-16 px-6 font-['Roboto']">
      <div className="max-w-[1248px] mx-auto">

        {/* WHO WE ARE */}
        <div className="grid md:grid-cols-2 gap-12 items-center">

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

          <div className="flex justify-end">
            <img
              src={whoWeAre.image_url}
              alt="who we are"
              className="w-[633px] h-[686px] object-cover"
            />
          </div>

        </div>

        {/* HISTORY */}
        <div className="grid md:grid-cols-2 gap-12 items-center mt-[200px]">

          <img
            src={history.image_url}
            alt="history"
            className="w-[400px] h-[400px] object-cover rounded-[16px]"
          />

          <div>
            <h2 className="text-3xl font-bold text-red-600 mb-4">
              {history.title}
            </h2>

            <p className="text-gray-600">
              {history.content}
            </p>
          </div>

        </div>

        {/* MISSION */}
        <div className="grid md:grid-cols-2 gap-16 items-start mt-[250px]">

          <img
            src={mission.image_url}
            alt="mission"
            className="w-[400px] h-[400px] object-cover rounded-[16px]"
          />

          <div className="flex gap-8 mt-20">

            <div className="w-[3px] h-[137px] bg-gradient-to-b from-[#FD1722] via-[#FF884D] to-[#76191F]" />

            <div>

              <h2 className="text-2xl font-bold text-[#FD1722]">
                {mission.title}
              </h2>

              <p className="text-gray-600 max-w-md">
                {mission.content}
              </p>

            </div>

          </div>

        </div>

        {/* VISION */}
        <div className="grid md:grid-cols-2 gap-16 items-start mt-[140px]">

          <div className="flex gap-8 justify-end mt-24">

            <div>

              <h2 className="text-2xl font-bold text-[#FD1722]">
                {vision.title}
              </h2>

              <p className="text-gray-600 max-w-md">
                {vision.content}
              </p>

            </div>

            <div className="w-[3px] h-[137px] bg-gradient-to-b from-[#FD1722] via-[#FF884D] to-[#76191F]" />

          </div>

          <img
            src={vision.image_url}
            alt="vision"
            className="w-[400px] h-[400px] object-cover rounded-[16px]"
          />

        </div>

        {/* INSTRUCTORS */}
        <div className="mt-24">

          <h2 className="text-[28px] font-bold text-[#D32F2F] mb-8">
            Instructors
          </h2>

          <div className="flex flex-wrap">

            {instructors.map((inst, i) => (
              <div key={i} className="w-[312px]">

                <img
                  src={inst.image}
                  alt={inst.name}
                  className="w-[312px] h-[390px] object-cover"
                />

                <div className="h-[108px] bg-[#F2F2F2] px-3 pt-4">

                  <p className="text-[12px] text-gray-500">
                    {inst.field}
                  </p>

                  <p className="text-[14px] font-medium text-[#D32F2F] mt-1">
                    {inst.name}
                  </p>

                </div>

              </div>
            ))}

          </div>

        </div>

      </div>
    </div>
  );
}