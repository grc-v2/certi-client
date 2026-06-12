import { Link } from 'react-router-dom'
import { Play, CheckCircle2, Layers, Zap, ArrowRight, Target } from 'lucide-react'

const MODES = [
  {
    key: 'free',
    title: 'Luyện tập tự do',
    desc: 'Học theo tốc độ của bạn, không giới hạn thời gian. Có giải thích chi tiết sau mỗi câu.',
    meta: 'Không giới hạn · Có giải thích',
    icon: Play,
    iconColor: 'var(--blue)',
    iconBg: 'var(--blue-soft)',
    link: '/practice/free',
    tone: 'blue',
    featured: false,
  },
  {
    key: 'exam',
    title: 'Thi thử ngay',
    desc: 'Mô phỏng đúng kỳ thi thật: đồng hồ đếm ngược, không xem đáp án ngay.',
    meta: '65 câu · 130 phút',
    icon: CheckCircle2,
    iconColor: 'var(--brand)',
    iconBg: 'var(--brand-soft)',
    link: '/practice/exam',
    tone: 'brand',
    featured: true,
  },
  {
    key: 'flashcard',
    title: 'Flashcard',
    desc: 'Ôn tập nhanh các khái niệm và định nghĩa. Lật thẻ để xem đáp án.',
    meta: 'Lật thẻ · ghi nhớ nhanh',
    icon: Layers,
    iconColor: 'var(--violet)',
    iconBg: 'var(--violet-soft)',
    link: '/practice/flashcard',
    tone: 'violet',
    featured: false,
  },
  {
    key: 'weakness',
    title: 'Khắc phục điểm yếu',
    desc: 'Tự động chọn chủ đề bạn đang yếu nhất dựa trên lịch sử làm bài.',
    meta: 'Dựa trên phân tích AI',
    icon: Zap,
    iconColor: 'var(--gold-deep)',
    iconBg: 'var(--gold-soft)',
    link: '/practice/weakness',
    tone: 'gold',
    featured: false,
  },
]

export default function PracticeLandingPage() {
  return (
    <div className="col" style={{ gap: 20 }}>
      {/* Header */}
      <div>
        <span className="eyebrow">Luyện tập</span>
        <h1 style={{ fontSize: 25, fontWeight: 800, color: 'var(--ink)', marginTop: 6 }}>
          Chọn cách bạn muốn luyện hôm nay
        </h1>
        <p style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 6 }}>
          Mỗi chế độ phù hợp với một mục tiêu khác nhau — từ học thư giãn đến mô phỏng áp lực phòng thi.
        </p>
      </div>

      {/* Mode cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        {MODES.map((m, i) => (
          <div
            key={m.key}
            className={`card enter enter-${i + 1}`}
            style={{
              padding: 0, overflow: 'hidden', position: 'relative',
              borderColor: m.featured
                ? 'color-mix(in srgb, var(--brand) 40%, var(--border))'
                : 'var(--border)',
            }}
          >
            {m.featured && (
              <div style={{ position: 'absolute', top: 14, right: 14, zIndex: 2 }}>
                <span className="pill brand" style={{ padding: '3px 9px', fontSize: 10.5 }}>
                  <Zap size={11} strokeWidth={2.4} /> Phổ biến
                </span>
              </div>
            )}

            <div style={{ padding: '22px 22px 0' }}>
              <div className="itile" style={{ width: 54, height: 54, background: m.iconBg, marginBottom: 16 }}>
                <m.icon size={28} style={{ color: m.iconColor }} />
              </div>
              <h3 style={{ fontSize: 19, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>
                {m.title}
              </h3>
              <p style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.55, marginBottom: 14, minHeight: 42 }}>
                {m.desc}
              </p>
            </div>

            <div className="row" style={{
              padding: '14px 22px', alignItems: 'center', justifyContent: 'space-between',
              gap: 10, borderTop: '1px solid var(--border)', background: 'var(--surface-2)',
            }}>
              <span className="mono" style={{ fontSize: 12, color: 'var(--ink-3)' }}>{m.meta}</span>
              <Link to={m.link}>
                <button
                  className={`btn3d sm${m.tone === 'violet' ? ' violet' : m.tone === 'gold' ? ' gold' : m.featured ? '' : ' ghost'}`}
                >
                  Bắt đầu <ArrowRight size={14} strokeWidth={2.4} />
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Weakness banner */}
      <div
        className="card enter enter-4"
        style={{
          padding: '20px 22px', position: 'relative', overflow: 'hidden',
          borderColor: 'color-mix(in srgb, var(--gold) 35%, var(--border))',
        }}
      >
        <div style={{
          position: 'absolute', top: -40, right: -30, width: 180, height: 180, borderRadius: '50%',
          background: 'radial-gradient(circle, var(--gold-soft), transparent 70%)',
        }} />
        <div className="row" style={{ gap: 16, alignItems: 'center', flexWrap: 'wrap', position: 'relative' }}>
          <div className="itile" style={{ width: 52, height: 52, background: 'var(--gold-soft)', flexShrink: 0 }}>
            <Target size={28} style={{ color: 'var(--gold-deep)' }} />
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>
              Tập trung vào điểm yếu ngay hôm nay
            </h3>
            <p style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>
              AI phân tích lịch sử thi của bạn và chọn ra các câu cần ôn lại ở những chủ đề còn yếu.
            </p>
          </div>
          <Link to="/practice/weakness">
            <button className="btn3d gold">
              <Zap size={16} strokeWidth={2.4} /> Ôn ngay
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
