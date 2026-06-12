import { Link } from 'react-router-dom'
import { Play, CheckCircle2, Layers, Zap, ChevronRight } from 'lucide-react'

const MODES = [
  {
    key: 'free',
    title: 'Luyện tập tự do',
    desc: 'Học theo tốc độ của bạn, không giới hạn',
    meta: 'Không giới hạn câu',
    icon: Play,
    iconColor: 'var(--blue)',
    iconBg: 'var(--blue-soft)',
    link: '/practice/free',
    featured: false,
  },
  {
    key: 'exam',
    title: 'Thi thử ngay',
    desc: 'Mô phỏng đúng kỳ thi thật, đồng hồ đếm ngược',
    meta: '65 câu · 130 phút',
    icon: CheckCircle2,
    iconColor: 'var(--brand)',
    iconBg: 'var(--brand-soft)',
    link: '/practice/exam',
    featured: true,
  },
  {
    key: 'flashcard',
    title: 'Flashcard',
    desc: 'Ôn tập nhanh các khái niệm, lật thẻ',
    meta: 'Lật thẻ · ghi nhớ',
    icon: Layers,
    iconColor: 'var(--violet)',
    iconBg: 'var(--violet-soft)',
    link: '/practice/flashcard',
    featured: false,
  },
  {
    key: 'weakness',
    title: 'Khắc phục điểm yếu',
    desc: 'Tập trung vào chủ đề bạn đang yếu nhất',
    meta: 'Dựa trên lịch sử',
    icon: Zap,
    iconColor: 'var(--gold-deep)',
    iconBg: 'var(--gold-soft)',
    link: '/practice/weakness',
    featured: false,
  },
]

export function PracticeModes() {
  return (
    <div className="card enter enter-2" style={{ padding: '18px 20px' }}>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>Chế độ luyện tập</h3>
        <Link
          to="/practice"
          className="row navlink"
          style={{ padding: '4px 8px', fontSize: 13, color: 'var(--brand-deep)', textDecoration: 'none', gap: 4 }}
        >
          Tất cả <ChevronRight size={15} />
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {MODES.map(m => (
          <Link
            key={m.key}
            to={m.link}
            style={{
              padding: '14px 14px', borderRadius: 'var(--radius)', cursor: 'pointer', textDecoration: 'none',
              border: `1.5px solid ${m.featured ? 'color-mix(in srgb, var(--brand) 40%, var(--border))' : 'var(--border)'}`,
              background: m.featured ? 'var(--brand-soft)' : 'var(--surface)',
              transition: 'transform .12s, box-shadow .12s',
              display: 'block',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
          >
            <div className="itile" style={{ width: 38, height: 38, background: m.iconBg, marginBottom: 10 }}>
              <m.icon size={20} style={{ color: m.iconColor }} />
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)' }}>{m.title}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }} className="mono">{m.meta}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
