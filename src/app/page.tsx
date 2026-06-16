import BudgetTracker from "@/components/BudgetTracker";
import { House } from "@phosphor-icons/react/dist/ssr";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50/80 pb-16">
      {/* Sticky Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.04)] sticky top-0 z-30 border-b border-slate-100/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-teal-50 p-1.5 rounded-lg">
              <House className="w-5 h-5 text-teal-600" weight="duotone" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              FlatSplitter
            </h1>
          </div>
          <span className="hidden sm:inline text-xs font-medium text-slate-400 tracking-wide uppercase">
            Move-in &amp; Monthly Tracker
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8">
        <BudgetTracker />
      </main>
    </div>
  );
}
