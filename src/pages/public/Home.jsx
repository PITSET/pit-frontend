import React, { useState } from "react";

export default function Home() {

  const projects = [
{
image:"https://tinypng.com/static/images/boat.png",
date:"26 DECEMBER 2029",
title:"Rover Project",
desc:"A student-led project that introduces robotics, programming, and automation."
},
{
image:"https://shorthand.com/the-craft/what-is-noise-in-photography/assets/3tYHUHrDJu/what-is-noise-in-photography-title-2460x1440.png",
date:"14 JANUARY 2030",
title:"AI Vision",
desc:"Research project exploring image recognition using artificial intelligence."
},
{
image:"https://picsum.photos/400/400?1",
date:"10 FEBRUARY 2030",
title:"Smart Automation",
desc:"Students create automated systems using sensors and microcontrollers."
},
{
image:"https://picsum.photos/400/400?2",
date:"3 MARCH 2030",
title:"Data Science Lab",
desc:"Students analyze real datasets to understand predictive modeling."
},

// NEW PROJECTS
{
image:"https://picsum.photos/400/400?3",
date:"15 APRIL 2030",
title:"Cyber Security Lab",
desc:"Students learn ethical hacking and security analysis."
},
{
image:"https://picsum.photos/400/400?4",
date:"28 MAY 2030",
title:"Cloud Computing",
desc:"Hands-on experience with distributed cloud infrastructure."
},
{
image:"https://picsum.photos/400/400?5",
date:"10 JUNE 2030",
title:"IoT Smart City",
desc:"Building smart city systems using IoT sensors."
}
];

  const [index, setIndex] = useState(0);

  const nextProject = () => {
    setIndex((index + 1) % projects.length);
  };

  const prevProject = () => {
    setIndex((index - 1 + projects.length) % projects.length);
  };

  const project = projects[index];

  return (
    <main className="w-full">

{/* HERO */}
<section className="relative h-[90vh] w-full flex items-center">

<div
className="absolute inset-0 bg-cover bg-center"
style={{
backgroundImage:
"url('https://static.vecteezy.com/system/resources/thumbnails/057/068/323/small/single-fresh-red-strawberry-on-table-green-background-food-fruit-sweet-macro-juicy-plant-image-photo.jpg')",
}}
/>

<div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>

<div className="relative max-w-7xl mx-auto px-6 lg:px-12 w-full">

<div className="max-w-2xl text-white">

<h1 className="font-bold text-[64px] leading-[1.1] mb-6">
Empowering Future <br />
Technologists
</h1>

<p className="text-[16px] text-gray-200 mb-8 max-w-lg">
Through practical education and innovative programs, we prepare
students to meet real-world challenges and lead in a rapidly
evolving technological landscape.
</p>

<button className="bg-red-600 text-white hover:bg-white hover:text-red-600 transition px-7 py-3 rounded-md font-semibold shadow-lg">
Explore Our Programs →
</button>

</div>
</div>

</section>


{/* ABOUT SECTION */}
<section className="relative h-[80vh] w-full flex items-center">

<div
className="absolute inset-0 bg-cover bg-center"
style={{
backgroundImage:
"url('https://gratisography.com/wp-content/uploads/2024/11/gratisography-augmented-reality-800x525.jpg')",
}}
/>

<div className="absolute inset-0 bg-black/50"></div>

<div className="relative max-w-7xl mx-auto w-full px-6 lg:px-12 flex justify-end">

<div className="max-w-md text-white -mt-10">

<h2 className="font-bold text-[48px] mb-4">
About Us
</h2>

<p className="text-[16px] text-gray-200 mb-6 leading-relaxed">
Prometheus Institute of Technology is dedicated to providing quality
technology education that builds strong foundations, practical skills,
and innovative thinking for future professionals.
</p>

<button className="text-[16px] border border-white px-6 py-3 rounded-md text-white transition hover:bg-red-600 hover:border-red-600">
DISCOVER OUR MISSION →
</button>

</div>
</div>

</section>


{/* FOUNDER SECTION */}
<section className="w-full bg-gray-100 py-24">

<div className="max-w-7xl mx-auto px-6 lg:px-12 grid md:grid-cols-2 gap-16 items-center">

<div>
<img
src="https://ikki-group.com/wp-content/uploads/2023/12/Image-Processing-face-scan-1024x1024.png"
alt="Founder"
className="w-[580px] h-[720px] object-cover"
/>
</div>

<div>

<p className="font-bold text-[24px] text-red-600 mb-3">
FOUNDER & PRINCIPAL
</p>

<h2 className="font-bold text-[64px] text-gray-900 mb-6">
Sheenaymu
</h2>

<p className="text-[16px] text-gray-600 leading-relaxed">
At Prometheus Institute of Technology, our mission is to create a clear
pathway for students to succeed in the world of technology.
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
LeyKler
</h2>

<p className="text-[16px] text-gray-600 leading-relaxed">
We believe education should ignite curiosity, creativity and confidence
for the next generation of technologists.
</p>

</div>

<div className="flex justify-end">
<img
src="https://c.topshort.org/sana_ai/flux_ai_image/scene/3.webp"
alt="LeyKler"
className="w-[580px] h-[720px] object-cover"
/>
</div>

</div>

</section>


{/* PROGRAMS SECTION */}
<section className="relative w-full h-[80vh] flex items-center">

  {/* Background Image */}
  <div
    className="absolute inset-0 bg-cover bg-center"
    style={{
      backgroundImage:
        "url('https://png.pngtree.com/thumb_back/fh260/background/20250227/pngtree-a-meadow-of-pink-and-purple-flowers-image_17005010.jpg')",
    }}
  />

  {/* Overlay */}
  <div className="absolute inset-0 bg-black/40"></div>

  {/* Content */}
  <div className="relative max-w-7xl mx-auto px-6 lg:px-12 w-full">

    <div className="max-w-md text-white">

      {/* Title */}
      <h2 className="font-[var(--font-family-robotoCondensed)] font-bold text-[48px] mb-4">
        Programs
      </h2>

      {/* Paragraph */}
      <p className="font-[var(--font-family-roboto)] text-[16px] text-gray-200 mb-6">
        Our programs are designed to provide strong technical foundations,
        practical skills, and industry-relevant knowledge to prepare students
        for future careers in technology.
      </p>

      {/* Button */}
      <button className="font-[var(--font-family-robotoCondensed)] text-[16px] bg-red-600 text-white px-6 py-3 rounded-md border border-red-600 hover:bg-white hover:text-red-600 transition">
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
src={projects[index].image}
alt="project"
className="w-[200px] h-[200px] object-cover rounded-xl shadow-md"
/>

{/* TEXT */}
<div>

<p className="text-sm text-gray-500">
{projects[index].date}
</p>

<h3 className="font-bold text-xl mt-1">
{projects[index].title}
</h3>

<p className="text-gray-600 text-sm mt-2 max-w-[260px]">
{projects[index].desc}
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
className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-red-500 text-lg transition hover:bg-red-500 hover:text-white"
>
←
</button>

<button
onClick={nextProject}
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