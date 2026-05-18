const icons = [
  { emoji: '🧠', top: '15%', left: '5%', anim: 'animate-float' },
  { emoji: '🔬', top: '30%', right: '8%', anim: 'animate-float-delayed' },
  { emoji: '💻', top: '55%', left: '3%', anim: 'animate-float-slow' },
  { emoji: '📊', top: '70%', right: '5%', anim: 'animate-float' },
  { emoji: '⚡', top: '40%', left: '92%', anim: 'animate-float-delayed' },
  { emoji: '🎯', top: '80%', left: '90%', anim: 'animate-float-slow' },
  { emoji: '🌟', top: '10%', right: '15%', anim: 'animate-float' },
  { emoji: '📚', top: '60%', left: '8%', anim: 'animate-float-delayed' },
];

export default function FloatingIcons() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-[0.04] dark:opacity-[0.06]">
      {icons.map((icon, i) => (
        <span
          key={i}
          className={`absolute text-6xl select-none ${icon.anim}`}
          style={{
            top: icon.top,
            left: icon.left,
            right: icon.right,
          }}
        >
          {icon.emoji}
        </span>
      ))}
    </div>
  );
}
