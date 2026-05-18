export default function Footer() {
  return (
    <footer className="border-t border-[#E2E8F0] dark:border-[#1E293B] bg-[#F1F5F9] dark:bg-[#0B1120] mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="text-lg font-bold text-primary">🧠 AI 进化之路</p>
            <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">
              从零基础到 AI 应用开发的结构化学习路线
            </p>
          </div>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
            保持好奇心，持续学习 🚀
          </p>
        </div>
      </div>
    </footer>
  );
}
