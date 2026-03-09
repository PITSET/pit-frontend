import React from "react";

export default function Home() {
  return (
    <main className="w-full">

      {/* HERO */}
      <section
        className="h-[90vh] bg-cover bg-center flex items-center"
        style={{ backgroundImage: "url('/hero.jpg')" }}
      >
        <div className="max-w-6xl mx-auto px-6 text-white">
          <h1 className="text-5xl font-bold mb-6">
            Empowering Future <br /> Psychologists
          </h1>

          <button className="bg-red-600 px-6 py-3 rounded text-white font-semibold">
            Learn Psychology
          </button>
        </div>
      </section>

      {/* ABOUT */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center px-6">
          
          <img
            src="/about.jpg"
            alt="about"
            className="rounded-lg shadow-lg"
          />

          <div>
            <h2 className="text-3xl font-bold mb-4">About Us</h2>

            <p className="text-gray-600 mb-6">
              We empower young minds to explore psychology through
              hands-on programs, mentorship, and real-world projects.
              Our goal is to create the next generation of thinkers,
              researchers, and innovators.
            </p>

            <button className="border px-6 py-3 rounded font-semibold">
              Read More
            </button>
          </div>
        </div>
      </section>

      {/* TRAINERS */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-6xl mx-auto px-6">

          <h2 className="text-3xl font-bold mb-12 text-center">
            Trainers & Founders
          </h2>

          <div className="grid md:grid-cols-2 gap-16">

            {/* Trainer 1 */}
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <img
                src="/trainer1.jpg"
                alt="trainer"
                className="rounded-lg"
              />

              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Sheenaymu
                </h3>

                <p className="text-gray-600">
                  Passionate psychology mentor helping students
                  understand human behaviour and build analytical
                  thinking skills.
                </p>
              </div>
            </div>

            {/* Trainer 2 */}
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  LeyKler
                </h3>

                <p className="text-gray-600">
                  Research-focused educator specializing in
                  experimental psychology and youth mentorship.
                </p>
              </div>

              <img
                src="/trainer2.jpg"
                alt="trainer"
                className="rounded-lg"
              />
            </div>

          </div>
        </div>
      </section>

      {/* PROGRAMS */}
      <section
        className="py-24 bg-cover bg-center text-white"
        style={{ backgroundImage: "url('/programs.jpg')" }}
      >
        <div className="max-w-6xl mx-auto px-6">

          <h2 className="text-3xl font-bold mb-6">
            Programs
          </h2>

          <button className="bg-red-600 px-6 py-3 rounded">
            View Programs
          </button>

        </div>
      </section>

      {/* PROJECTS */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-6xl mx-auto px-6">

          <h2 className="text-3xl font-bold mb-12 text-center">
            Projects
          </h2>

          <div className="flex justify-center">

            <div className="bg-white shadow-lg rounded-xl p-6 w-80">

              <img
                src="/project.jpg"
                alt="project"
                className="rounded mb-4"
              />

              <h3 className="text-lg font-semibold">
                AI Mini Project
              </h3>

              <p className="text-gray-600 text-sm mt-2">
                A student research project exploring behavioral
                prediction using AI techniques.
              </p>

              <button className="mt-4 border px-4 py-2 rounded text-sm">
                View Project
              </button>

            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-4 gap-8">

          <div>
            <h4 className="font-semibold text-white mb-4">
              Psychology Club
            </h4>

            <p className="text-sm">
              Inspiring the next generation of psychologists.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">
              Links
            </h4>

            <ul className="space-y-2 text-sm">
              <li>About</li>
              <li>Programs</li>
              <li>Projects</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">
              Programs
            </h4>

            <ul className="space-y-2 text-sm">
              <li>Beginner</li>
              <li>Research</li>
              <li>Workshops</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">
              Follow Us
            </h4>

            <p className="text-sm">
              Instagram • YouTube • LinkedIn
            </p>
          </div>

        </div>

        <div className="text-center text-sm text-gray-500 mt-10">
          © 2025 Psychology Club
        </div>
      </footer>

    </main>
  );
}