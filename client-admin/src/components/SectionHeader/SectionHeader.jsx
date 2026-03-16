export const SectionHeader = ({ section }) => {
  return (
    <div className="bg-slate-900/40 border-b border-white/5 backdrop-blur-sm px-6 lg:px-10 py-4 flex items-center justify-between animate-in slide-in-from-top-2 duration-500">
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
        <h2 className="text-xl font-bold text-slate-200 tracking-tight">{section}</h2>
      </div>
    </div>
  );
};
