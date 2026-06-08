import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Menu, X } from 'lucide-react'
import { Input } from 'antd'
import { cn } from '@/lib/utils'

interface TopNavProps {
  onMenuClick?: () => void
  sidebarOpen?: boolean
}

export function TopNav({ onMenuClick, sidebarOpen }: TopNavProps) {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header className="fixed top-4 left-4 lg:left-[17.5rem] right-4 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl safe-area-top flex flex-col shadow-sm transition-all duration-300">
      <div className="h-14 flex items-center px-4 gap-3">
        {/* Logo + menu toggle */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors lg:hidden"
          >
            {sidebarOpen ? <X className="w-5 h-5 text-slate-600 dark:text-slate-300" /> : <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />}
          </button>
          <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer no-underline">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white hidden sm:block">CertiMaster</span>
          </Link>
        </div>

        {/* Search */}
        <div className={cn('flex-1 max-w-xl mx-auto', searchOpen ? 'block' : 'hidden sm:block')}>
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-slate-400 z-10" />
            <Input
              placeholder="Tìm kiếm chứng chỉ, bài viết, tag..."
              className="pl-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 rounded-xl"
              variant="borderless"
              style={{ paddingLeft: '2.25rem', height: '2.5rem', background: 'var(--color-bg-container)' }}
            />
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-auto sm:ml-0">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors sm:hidden text-slate-600 dark:text-slate-300"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
