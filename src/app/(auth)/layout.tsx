export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 cursor-pointer">
            <div className="w-10 h-10 bg-[#0A66C2] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">CertiMaster</span>
          </a>
          <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">Nền tảng học chứng chỉ chuyên sâu</p>
        </div>
        {children}
      </div>
    </div>
  )
}
