import { Link } from 'react-router-dom'
import { Play, CheckCircle2, Layers, Zap, ArrowRight, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'

const MODES = [
  {
    key: 'free',
    title: 'Luyện tập tự do',
    desc: 'Học theo tốc độ của bạn, không giới hạn thời gian. Có giải thích chi tiết sau mỗi câu.',
    meta: 'Không giới hạn · Có giải thích',
    icon: Play,
    link: '/practice/free',
    featured: false,
  },
  {
    key: 'exam',
    title: 'Thi thử ngay',
    desc: 'Mô phỏng đúng kỳ thi thật: đồng hồ đếm ngược, không xem đáp án ngay.',
    meta: '65 câu · 130 phút',
    icon: CheckCircle2,
    link: '/practice/exam',
    featured: true,
  },
  {
    key: 'flashcard',
    title: 'Flashcard',
    desc: 'Ôn tập nhanh các khái niệm và định nghĩa. Lật thẻ để xem đáp án.',
    meta: 'Lật thẻ · ghi nhớ nhanh',
    icon: Layers,
    link: '/practice/flashcard',
    featured: false,
  },
  {
    key: 'weakness',
    title: 'Khắc phục điểm yếu',
    desc: 'Tự động chọn chủ đề bạn đang yếu nhất dựa trên lịch sử làm bài.',
    meta: 'Dựa trên phân tích AI',
    icon: Zap,
    link: '/practice/weakness',
    featured: false,
  },
]

export default function PracticeLandingPage() {
  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-accent">Luyện tập</span>
        <h1 className="text-[25px] font-extrabold text-ink mt-1.5">
          Chọn cách bạn muốn luyện hôm nay
        </h1>
        <p className="text-sm text-ink-soft mt-1.5">
          Mỗi chế độ phù hợp với một mục tiêu khác nhau — từ học thư giãn đến mô phỏng áp lực phòng thi.
        </p>
      </div>

      {/* Mode cards */}
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        {MODES.map((m) => (
          <div
            key={m.key}
            className={`relative overflow-hidden rounded-[var(--radius-card)] bg-surface border ${m.featured ? 'border-accent/40' : 'border-line'}`}
          >
            {m.featured && (
              <div className="absolute top-3.5 right-3.5 z-[2]">
                <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft text-accent-ink px-2 py-0.5 text-[10.5px] font-semibold">
                  <Zap size={11} strokeWidth={2.4} /> Phổ biến
                </span>
              </div>
            )}

            <div className="px-[22px] pt-[22px]">
              <div className="flex items-center justify-center w-[54px] h-[54px] rounded-[var(--radius-inner)] bg-surface-muted text-ink mb-4">
                <m.icon size={28} />
              </div>
              <h3 className="text-[19px] font-bold text-ink mb-1.5">
                {m.title}
              </h3>
              <p className="text-[13.5px] text-ink-soft leading-[1.55] mb-3.5 min-h-[42px]">
                {m.desc}
              </p>
            </div>

            <div className="flex items-center justify-between gap-2.5 px-[22px] py-3.5 border-t border-line bg-surface-muted">
              <span className="font-mono text-xs text-ink-faint">{m.meta}</span>
              <Link to={m.link}>
                <Button size="sm" variant={m.featured ? 'default' : 'outline'}>
                  Bắt đầu <ArrowRight size={14} strokeWidth={2.4} />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Weakness banner */}
      <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-surface border border-accent/30 px-[22px] py-5">
        <div className="flex flex-wrap items-center gap-4 relative">
          <div className="flex items-center justify-center w-[52px] h-[52px] rounded-[var(--radius-inner)] bg-accent-soft text-accent flex-shrink-0">
            <Target size={28} />
          </div>
          <div className="flex-1 min-w-[220px]">
            <h3 className="text-[17px] font-bold text-ink mb-1">
              Tập trung vào điểm yếu ngay hôm nay
            </h3>
            <p className="text-[13.5px] text-ink-soft">
              AI phân tích lịch sử thi của bạn và chọn ra các câu cần ôn lại ở những chủ đề còn yếu.
            </p>
          </div>
          <Link to="/practice/weakness">
            <Button>
              <Zap size={16} strokeWidth={2.4} /> Ôn ngay
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
