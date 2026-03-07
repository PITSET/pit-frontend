import React from "react";

const instructors = [
  {
    name: "John Carter",
    position: "Engineering Instructor",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
  },
  {
    name: "Lisa Chen",
    position: "Software Instructor",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
  },
  {
    name: "David Kim",
    position: "AI Instructor",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
  },
  {
    name: "Anna Smith",
    position: "Design Instructor",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
  },
  {
    name: "Michael Lee",
    position: "Networking Instructor",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
  },
  {
    name: "Kevin Zhang",
    position: "Robotics Instructor",
    image: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79",
  },
];

export default function About() {
  return (
    <div className="bg-gray-100 py-16 px-6">
      <div className="max-w-6xl mx-auto space-y-24">

        {/* WHO WE ARE */}
        <div className="grid md:grid-cols-2 gap-12 items-center">

          <div>
            <div className="flex items-center gap-3 mb-4">

              <span className="bg-gradient-to-r from-[#FB1E28] to-[#FF8950] text-white text-[24px] font-bold px-6 py-2 rounded-l-[8px] rounded-r-[0px]">
                WHO
              </span>

              <span className="text-gray-700 text-[24px] font-bold tracking-wide">
                WE ARE
              </span>

            </div>

            <h1 className="text-4xl font-bold text-red-600 mb-2">
              Building
            </h1>

            <h1 className="text-4xl font-bold text-red-600 mb-6">
              Future Innovators
            </h1>

            <p className="text-gray-600 leading-relaxed">
              Our institute is committed to empowering students with the
              knowledge and skills required in the modern technology world.
              Through innovative teaching, practical training, and strong
              industry connections, we prepare students to become leaders
              in technology and engineering.
            </p>
          </div>

          <div className="flex justify-end">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
              alt="students"
              className="w-[633px] h-[686px] object-cover rounded-none shadow-lg"
            />
          </div>

        </div>

        {/* HISTORY */}
        <div className="grid md:grid-cols-2 gap-12 items-center">

          <div className="flex justify-center">
            <img
              src="https://images.unsplash.com/photo-1551836022-d5d88e9218df"
              alt="history"
              className="w-[400px] h-[400px] object-cover rounded-[16px] shadow-lg"
            />
          </div>

          <div>
            <h2 className="text-3xl font-bold text-red-600 mb-4">
              History
            </h2>

            <p className="text-gray-600 leading-relaxed">
              Since our founding, we have focused on delivering quality
              education that bridges academic knowledge with real-world
              experience. Our programs continuously evolve to match
              industry needs and technological advancements.
            </p>
          </div>

        </div>

        {/* MISSION */}
        <div className="grid md:grid-cols-2 gap-12 items-center">

          <img
            src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
            alt="mission"
            className="w-full h-[400px] object-cover rounded-lg shadow-lg"
          />

          <div>
            <h2 className="text-3xl font-bold text-red-600 mb-4">
              Mission
            </h2>

            <p className="text-gray-600 leading-relaxed">
              Our mission is to provide practical technology education
              that inspires innovation, creativity, and leadership.
              We aim to equip students with the technical expertise
              needed to succeed in the digital era.
            </p>
          </div>

        </div>

        {/* VISION */}
        <div className="grid md:grid-cols-2 gap-12 items-center">

          <div className="relative pr-8">

            <div className="absolute right-0 top-0 h-full w-1 bg-red-600"></div>

            <h2 className="text-3xl font-bold text-red-600 mb-4">
              Vision
            </h2>

            <p className="text-gray-600 leading-relaxed">
              Our vision is to become a leading technology institute
              that nurtures innovation, encourages lifelong learning,
              and produces highly skilled professionals who shape
              the future of technology.
            </p>

          </div>

          <img
            src="https://images.unsplash.com/photo-1518770660439-4636190af475"
            alt="vision"
            className="w-full h-[400px] object-cover rounded-lg shadow-lg"
          />

        </div>

        {/* INSTRUCTORS */}
        <div>

          <h2 className="text-3xl font-bold text-red-600 mb-10 text-center">
            Instructors
          </h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">

            {instructors.map((inst, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md text-center p-4 hover:shadow-xl transition"
              >

                <img
                  src={inst.image}
                  alt={inst.name}
                  className="w-full h-48 object-cover rounded"
                />

                <h3 className="mt-4 font-semibold">
                  {inst.name}
                </h3>

                <p className="text-red-600 text-sm">
                  {inst.position}
                </p>

              </div>
            ))}

          </div>

        </div>

      </div>
    </div>
  );
}