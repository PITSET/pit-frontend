import React from "react";

const About = () => {
  return (
    <div className="bg-gray-100 py-16">
      <div className="max-w-6xl mx-auto px-6">

        {/* WHO WE ARE */}
        <h2 className="font-roboto text-[24px] font-bold mb-10">
          WHO WE ARE
        </h2>

        {/* Building Future Innovators */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div>
            <h1 className="font-dmsans text-[32px] font-normal mb-4">
              Building Future Innovators
            </h1>

            <p className="font-dmsans text-[16px] font-normal text-gray-600 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Suspendisse varius enim in eros elementum tristique. Duis cursus,
              mi quis viverra ornare, eros dolor interdum nulla.
            </p>
          </div>

          {/* Image */}
          <div className="w-full h-[300px] bg-gray-300 rounded-lg"></div>
        </div>


        {/* History */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">

          {/* Image */}
          <div className="w-full h-[260px] bg-gray-300 rounded-lg"></div>

          <div>
            <h2 className="font-roboto text-[64px] font-bold text-red-500 mb-4">
              History
            </h2>

            <p className="font-dmsans text-[16px] text-gray-600 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Pellentesque habitant morbi tristique senectus et netus et
              malesuada fames ac turpis egestas.
            </p>
          </div>
        </div>


        {/* Mission */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">

          {/* Image */}
          <div className="w-full h-[260px] bg-gray-300 rounded-lg"></div>

          <div>
            <h3 className="font-roboto text-[40px] font-bold text-red-500 mb-4">
              Mission
            </h3>

            <p className="font-dmsans text-[16px] text-gray-600">
              Our mission is to empower learners with modern skills and
              innovative thinking to prepare them for the future.
            </p>
          </div>
        </div>


        {/* Vision */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">

          <div>
            <h3 className="font-roboto text-[40px] font-bold text-red-500 mb-4">
              Vision
            </h3>

            <p className="font-dmsans text-[16px] text-gray-600">
              Our vision is to inspire creativity and technological
              innovation for the next generation of leaders.
            </p>
          </div>

          {/* Image */}
          <div className="w-full h-[260px] bg-gray-300 rounded-lg"></div>
        </div>


        {/* Instructors */}
        <div>
          <h2 className="font-roboto text-[40px] font-bold text-red-500 mb-10">
            Instructors
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[1,2,3,4,5,6].map((item)=>(
              <div key={item} className="text-center">
                <div className="w-full h-[200px] bg-gray-300 rounded-lg mb-4"></div>

                <p className="font-dmsans text-[16px] font-medium">
                  Instructor Name
                </p>

                <p className="font-dmsans text-sm text-gray-500">
                  Position
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;