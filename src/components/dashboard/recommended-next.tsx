import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function RecommendedNext() {
  return (
    <Card className="border-cta/30 bg-gradient-to-br from-cta/5 to-transparent relative overflow-hidden group hover:border-cta/50 transition-colors">
      <div className="absolute top-0 right-0 w-32 h-32 bg-cta/10 rounded-full blur-2xl group-hover:bg-cta/20 transition-colors pointer-events-none" />
      <CardContent className="p-5 flex flex-col sm:flex-row items-center gap-4 justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cta/10 rounded-xl">
            <Sparkles className="w-6 h-6 text-cta animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Gợi ý tiếp theo từ AI
              <span className="text-[10px] bg-cta text-primary px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Beta</span>
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
              Bạn đang yếu phần <strong className="text-slate-700 dark:text-slate-300">Security and Compliance</strong>. Hãy ôn tập lại 15 câu hỏi sai gần đây để củng cố kiến thức.
            </p>
          </div>
        </div>
        <Link to="/practice/weakness" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto bg-primary hover:bg-slate-800 text-white rounded-xl shadow-md cursor-pointer transition-transform hover:-translate-y-0.5 px-6 font-semibold">
            Ôn tập ngay
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
