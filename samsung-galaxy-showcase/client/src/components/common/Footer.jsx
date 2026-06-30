export default function Footer() {
  return (
    <footer className="w-full bg-[#020204] border-t border-white/5 py-10 mt-20">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-white/30 text-[10px] uppercase tracking-widest font-mono">
        <p>© {new Date().getFullYear()} Samsung Galaxy Showcase. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">Support</a>
        </div>
      </div>
    </footer>
  )
}
