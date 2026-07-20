import React from 'react';

const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-sm font-bold text-primary-500 tracking-wider uppercase font-display">
          Our Story
        </span>
        <h1 className="text-4xl font-extrabold font-display text-txt-title mt-3 mb-6">
          Empowering Health & Wellness, Digitally
        </h1>
        <p className="text-lg text-txt-muted">
          CuraCare was founded with a simple yet powerful mission: to make high-quality, verified pharmaceutical care accessible, transparent, and affordable for everyone.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
        <div>
          <img
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800"
            alt="Medical Team"
            className="rounded-2xl shadow-xl border border-bdr-main"
          />
        </div>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold font-display text-txt-title">
            Who We Are
          </h2>
          <p className="text-txt-muted leading-relaxed">
            We are a group of dedicated healthcare professionals, software architects, and pharmacists who believe that acquiring medicine shouldn't be stressful. We combine digital technologies like AI-driven search with real-world clinical standards to provide a premium online experience.
          </p>
          <div className="grid grid-cols-2 gap-6 pt-4">
            <div className="p-5 glass-panel rounded-xl">
              <h3 className="text-2xl font-bold text-primary-500 font-display">15k+</h3>
              <p className="text-xs text-txt-muted mt-1">Happy Patients</p>
            </div>
            <div className="p-5 glass-panel rounded-xl">
              <h3 className="text-2xl font-bold text-primary-500 font-display">100%</h3>
              <p className="text-xs text-txt-muted mt-1">Verified Products</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
