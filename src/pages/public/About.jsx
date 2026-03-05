import React from "react";

export default function About() {
  return (
    <div className="bg-[#f3f3f5] py-16">
      <div className="max-w-6xl mx-auto px-6">

        {/* WHO WE ARE */}
        <h2 className="font-['Roboto_Condensed'] text-[24px] font-bold mb-6">
          WHO WE ARE
        </h2>

        {/* Building Future Innovators */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div>
            <h1 className="font-['DM_Sans'] text-[32px] font-normal mb-4">
              Building Future Innovators
            </h1>

            <p className="font-['DM_Sans'] text-[16px] leading-relaxed text-gray-600">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
              Pellentesque habitant morbi tristique senectus et netus et 
              malesuada fames ac turpis egestas. Vestibulum tortor quam, 
              feugiat vitae, ultricies eget, tempor sit amet, ante.
            </p>
          </div>

          {/* Image placeholder */}
          <div className="w-full h-[280px] bg-gray-300 rounded-lg"></div>
        </div>

        {/* History */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">

          {/* Image placeholder */}
          <div className="w-full h-[260px] bg-gray-300 rounded-lg"></div>

          <div>
            <h2 className="font-['Roboto_Condensed'] text-[64px] font-bold mb-6">
              History
            </h2>

            <p className="font-['DM_Sans'] text-[16px] text-gray-600 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
              Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. 
              Nullam varius, turpis et commodo pharetra, est eros bibendum elit.
            </p>
          </div>
        </div>

        {/* Mission */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">

          {/* Image placeholder */}
          <div className="w-full h-[260px] bg-gray-300 rounded-lg"></div>

          <div>
            <h3 className="font-['Roboto_Condensed'] text-[40px] font-bold mb-4">
              Mission
            </h3>

            <p className="font-['DM_Sans'] text-[16px] text-gray-600 leading-relaxed">
              Our mission is to empower students with innovative thinking, 
              creativity, and technological knowledge to shape the future.
            </p>
          </div>
        </div>

        {/* Vision */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div>
            <h3 className="font-['Roboto_Condensed'] text-[40px] font-bold mb-4">
              Vision
            </h3>

            <p className="font-['DM_Sans'] text-[16px] text-gray-600 leading-relaxed">
              Our vision is to become a leading educational platform that 
              nurtures innovation and prepares future leaders for the 
              rapidly evolving technological world.
            </p>
          </div>

          {/* Image placeholder */}
          <div className="w-full h-[260px] bg-gray-300 rounded-lg"></div>
        </div>

        {/* Instructors */}
        <div>
          <h2 className="font-['Roboto_Condensed'] text-[40px] font-bold mb-10">
            Instructors
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

            {[1,2,3,4,5,6].map((item) => (
              <div key={item} className="text-center">
                <div className="w-full h-[200px] bg-gray-300 rounded-lg mb-4"></div>
                <p className="font-['DM_Sans'] text-[16px] font-medium">
                  Instructor Name
                </p>
                <p className="font-['DM_Sans'] text-sm text-gray-500">
                  Position
                </p>
              </div>
            ))}

          </div>
        </div>

      </div>
    </div>
  );
}