import logo from '../assets/ai-tool-tracker-logo.png';

export default function BrandLogo({ compact = false, className = '' }) {
  return (
    <div className={`flex items-center ${compact ? 'gap-2' : 'gap-3'} ${className}`}>
      <img
        src={logo}
        alt="AI Tool Tracker"
        className={compact ? 'h-10 w-auto object-contain' : 'h-14 w-auto object-contain'}
      />
      {!compact && (
        <div>
          <h1 className="text-xl font-bold text-white">AI Tool Tracker</h1>
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-200/70">Workspace Monitor</p>
        </div>
      )}
    </div>
  );
}
