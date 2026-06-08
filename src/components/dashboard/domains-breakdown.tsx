import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Target, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Progress } from '@/components/ui/progress'

export function DomainsBreakdown() {
  const domains = [
    { id: '1', name: 'Cloud Concepts', coverage: 85, mastery: 'Advanced' },
    { id: '2', name: 'Security and Compliance', coverage: 60, mastery: 'Intermediate' },
    { id: '3', name: 'Technology', coverage: 45, mastery: 'Beginner' },
    { id: '4', name: 'Billing and Pricing', coverage: 90, mastery: 'Advanced' },
  ]

  return (
    <Card className="border-slate-200/60 dark:border-slate-800 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/30">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Target className="w-4.5 h-4.5 text-primary" />
          Mức độ bao phủ Domains
        </CardTitle>
        <Link to="/learn/domains" className="text-xs text-primary font-semibold flex items-center hover:underline">
          Chi tiết
          <ChevronRight className="w-3 h-3 ml-0.5" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {domains.map((domain) => (
          <div key={domain.id} className="domain-item p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-cta/30 transition-colors bg-white dark:bg-slate-900/50 cursor-pointer group">
            <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
              <span className="font-bold font-heading text-slate-800 dark:text-slate-200 truncate pr-4 group-hover:text-cta transition-colors">{domain.name}</span>
              <span className="text-slate-500 font-mono font-semibold flex-shrink-0">{domain.coverage}%</span>
            </div>
            <div className="flex items-center gap-3">
              <Progress value={domain.coverage} className="h-1.5 flex-1 bg-slate-100 dark:bg-slate-800" />
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                domain.coverage >= 80 ? 'bg-success/10 text-success' : domain.coverage >= 50 ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' : 'bg-danger/10 text-danger'
              }`}>
                {domain.mastery}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
