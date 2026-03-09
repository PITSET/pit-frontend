import React from "react";

export default function Home() {
  return (
    <main className="w-full">
{/* HERO */}
<section className="relative h-[90vh] w-full flex items-center">

  {/* Background Image */}
  <div
    className="absolute inset-0 bg-cover bg-center"
    style={{
      backgroundImage:
        "url('https://static.vecteezy.com/system/resources/thumbnails/057/068/323/small/single-fresh-red-strawberry-on-table-green-background-food-fruit-sweet-macro-juicy-plant-image-photo.jpg')",
    }}
  />

  {/* Gradient Overlay */}
  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>

  {/* Content */}
  <div className="relative max-w-7xl mx-auto px-6 lg:px-12 w-full">

    <div className="max-w-2xl text-white">

      {/* Title */}
      <h1 className="font-[var(--font-family-robotoCondensed)] font-bold text-[64px] leading-[1.1] mb-6">
        Empowering Future <br />
        Technologists
      </h1>

      {/* Paragraph */}
      <p className="font-[var(--font-family-roboto)] text-[16px] text-gray-200 mb-8 max-w-lg">
        Through practical education and innovative programs, we prepare
        students to meet real-world challenges and lead in a rapidly
        evolving technological landscape.
      </p>

      {/* Button */}
      <button className="bg-red-600 text-white hover:bg-white hover:text-red-600 transition px-7 py-3 rounded-md font-semibold shadow-lg">
  Explore Our Programs →
</button>

    </div>

  </div>

</section>
{/* ABOUT SECTION */}
<section className="relative h-[80vh] w-full flex items-center">

  {/* Background Image */}
  <div
    className="absolute inset-0 bg-cover bg-center"
    style={{
      backgroundImage:
        "url('https://gratisography.com/wp-content/uploads/2024/11/gratisography-augmented-reality-800x525.jpg')",
    }}
  />

  {/* Overlay */}
  <div className="absolute inset-0 bg-black/50"></div>

  {/* Content */}
  <div className="relative max-w-7xl mx-auto w-full px-6 lg:px-12 flex justify-end">

    {/* move text slightly upward */}
    <div className="max-w-md text-white -mt-10">

      {/* Title */}
      <h2 className="font-[var(--font-family-robotoCondensed)] font-bold text-[48px] mb-4">
        About Us
      </h2>

      {/* Paragraph */}
      <p className="font-[var(--font-family-roboto)] text-[16px] text-gray-200 mb-6 leading-relaxed">
        Prometheus Institute of Technology is dedicated to providing quality
        technology education that builds strong foundations, practical skills,
        and innovative thinking for future professionals.
      </p>

      {/* Button */}
      <button className="font-[var(--font-family-robotoCondensed)] text-[16px] border border-white px-6 py-3 rounded-md text-white transition hover:bg-red-600 hover:border-red-600">
        DISCOVER OUR MISSION →
      </button>

    </div>

  </div>

</section>
{/* FOUNDER SECTION */}
<section className="w-full bg-gray-100 py-24">

  <div className="max-w-7xl mx-auto px-6 lg:px-12 grid md:grid-cols-2 gap-16 items-center">

    {/* Image */}
    <div>
      <img
        src="https://ikki-group.com/wp-content/uploads/2023/12/Image-Processing-face-scan-1024x1024.png"
        alt="Founder"
        className="w-[580px] h-[720px] object-cover"
      />
    </div>

    {/* Text */}
    <div>

      {/* Founder Label */}
      <p className="font-[var(--font-family-robotoCondensed)] font-bold text-[24px] text-red-600 mb-3">
        FOUNDER & PRINCIPAL
      </p>

      {/* Name */}
      <h2 className="font-[var(--font-family-robotoCondensed)] font-bold text-[64px] text-gray-900 mb-6">
        Sheenaymu
      </h2>

      {/* Paragraph */}
      <p className="font-[var(--font-family-roboto)] text-[16px] text-gray-600 leading-relaxed">
        At Prometheus Institute of Technology, our mission is to create a clear
        pathway for students to succeed in the world of technology. We are
        committed to equipping learners with strong foundations, practical
        skills, and the confidence needed to thrive in today’s fast-changing
        digital landscape.
        <br /><br />
        Through industry-aligned programs and hands-on learning, we focus on
        bridging the gap between academic knowledge and real-world application.
        Our approach emphasizes innovation, critical thinking, and continuous
        improvement.
        <br /><br />
        With a deep understanding of the demands of modern technology careers,
        our team supports students at every stage of their learning journey.
        We believe in collaboration, integrity, and excellence—working together
        to build an environment where every student can unlock their full
        potential and shape the future.
      </p>

    </div>

  </div>

</section>

{/* FOUNDER SECTION 2 */}
<section className="w-full bg-gray-100 py-24">

  <div className="max-w-7xl mx-auto px-6 lg:px-12 grid md:grid-cols-2 gap-16 items-center">

    {/* Text */}
    <div>

      {/* Label */}
      <p className="font-[var(--font-family-robotoCondensed)] font-bold text-[24px] text-red-600 mb-3">
        FOUNDER & PRINCIPAL
      </p>

      {/* Name */}
      <h2 className="font-[var(--font-family-robotoCondensed)] font-bold text-[64px] text-gray-900 mb-6">
        LeyKler
      </h2>

      {/* Paragraph */}
      <p className="font-[var(--font-family-roboto)] text-[16px] text-gray-600 leading-relaxed">
        At Prometheus Institute of Technology, we believe education should do
        more than transfer knowledge—it should ignite curiosity, creativity,
        and confidence. Our vision is to build an institution where technology
        education is practical, relevant, and aligned with the needs of the
        future.
        <br /><br />
        We focus on creating an environment that encourages innovation,
        problem-solving, and continuous learning. By combining strong academic
        principles with real-world applications, we prepare students to adapt,
        grow, and lead in an ever-changing digital landscape.
        <br /><br />
        Our commitment is to support every learner through guidance,
        mentorship, and a culture of excellence, ensuring they are not only
        ready for today’s challenges but empowered to shape tomorrow.
      </p>

    </div>

    {/* Image */}
    <div className="flex justify-end">
      <img
        src="https://c.topshort.org/sana_ai/flux_ai_image/scene/3.webp"
        alt="LeyKler"
        className="w-[580px] h-[720px] object-cover"
      />
    </div>

  </div>

</section>

       


      

    </main>
  );
}