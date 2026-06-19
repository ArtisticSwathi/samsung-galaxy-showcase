import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-between font-sans overflow-x-hidden selection:bg-cyan-500 selection:text-slate-950">
      {/* Background Gradient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-7xl px-8 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="font-bold text-xl tracking-tighter text-slate-950">S</span>
          </div>
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            GALAXY SHOWCASE
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium text-slate-400">
          <span className="hover:text-white transition-colors cursor-pointer">Client Panel</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="text-cyan-400">Tailwind + 3D Active</span>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 max-w-4xl z-10 my-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5 text-xs text-blue-400 font-medium mb-8 backdrop-blur-sm">
          <span>Vite + React + Tailwind v4 + Three.js Setup Complete</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-100 to-slate-500 leading-tight">
          Next-Generation <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400">
            Samsung Galaxy Showcase
          </span>
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          Your client-side environment is ready. Equipped with React Three Fiber, GSAP, and Redux Toolkit to build a stunning, interactive 3D e-commerce experience.
        </p>

        {/* Action Button & Counter */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <button 
            onClick={() => setCount(c => c + 1)}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 font-semibold hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-cyan-500/20 cursor-pointer text-slate-950 flex items-center gap-2"
          >
            Explore Interface 
            <span className="px-2 py-0.5 rounded bg-slate-950/20 text-xs font-bold text-slate-950">
              {count} clicks
            </span>
          </button>
          <a 
            href="#tech-stack"
            className="px-8 py-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-slate-700 font-semibold transition-all backdrop-blur-sm cursor-pointer"
          >
            View Tech Stack
          </a>
        </div>

        {/* Installed Tech Grid */}
        <div id="tech-stack" className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          {/* Tech 1 */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm hover:border-blue-500/30 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4 group-hover:bg-blue-500/20 transition-all">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-200 mb-1">Three.js & R3F</h3>
            <p className="text-xs text-slate-500">Immersive 3D model viewport & interactions.</p>
          </div>

          {/* Tech 2 */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm hover:border-indigo-500/30 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 group-hover:bg-indigo-500/20 transition-all">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-200 mb-1">GSAP Animations</h3>
            <p className="text-xs text-slate-500">Ultra-smooth scrolling & micro-interactions.</p>
          </div>

          {/* Tech 3 */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm hover:border-cyan-500/30 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-4 group-hover:bg-cyan-500/20 transition-all">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-200 mb-1">Redux Toolkit</h3>
            <p className="text-xs text-slate-500">Global cart, product state, & checkout logic.</p>
          </div>

          {/* Tech 4 */}
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm hover:border-emerald-500/30 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4 group-hover:bg-emerald-500/20 transition-all">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-200 mb-1">React Router</h3>
            <p className="text-xs text-slate-500">Seamless navigation between pages & shop.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950/80 backdrop-blur-md py-6 px-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4 z-10">
        <div>&copy; {new Date().getFullYear()} Samsung Galaxy Showcase App. All rights reserved.</div>
        <div className="flex gap-6">
          <a href="https://react.dev/" target="_blank" rel="noreferrer" className="hover:text-slate-400 transition-colors">React Documentation</a>
          <a href="https://threejs.org/" target="_blank" rel="noreferrer" className="hover:text-slate-400 transition-colors">Three.js Docs</a>
          <a href="https://tailwindcss.com/" target="_blank" rel="noreferrer" className="hover:text-slate-400 transition-colors">Tailwind CSS</a>
        </div>
      </footer>
    </div>
  )
}

export default App
