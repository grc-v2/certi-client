import { Sparkles, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function RecommendedNext() {
  return (
    <div
      className="card enter enter-2"
      style={{
        padding: 0, overflow: 'hidden', position: 'relative',
        borderColor: 'color-mix(in srgb, var(--violet) 35%, var(--border))',
      }}
    >
      {/* Gradient top bar */}
      <div style={{ height: 4, background: 'linear-gradient(90deg, var(--violet), var(--brand))' }} />

      <div style={{ padding: '20px 22px' }}>
        <div className="row" style={{ gap: 13, alignItems: 'flex-start' }}>
          <div className="itile" style={{ width: 46, height: 46, background: 'var(--violet-soft)', flexShrink: 0 }}>
            <Sparkles size={24} style={{ color: 'var(--violet)' }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <span className="pill violet" style={{ marginBottom: 8, display: 'inline-flex' }}>
              <Sparkles size={12} strokeWidth={2.4} /> AI Gợi ý
            </span>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, color: 'var(--ink)' }}>
              Ôn tập điểm yếu ngay hôm nay
            </h3>
            <p style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.55, marginBottom: 16 }}>
              Bạn đang yếu phần <strong style={{ color: 'var(--ink)' }}>Security &amp; Compliance</strong>.
              Hãy ôn lại 15 câu sai gần đây để củng cố kiến thức.
            </p>
            <div className="row" style={{ gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <Link to="/practice/weakness">
                <button className="btn-3d btn-3d-violet" style={{ background: 'var(--violet)', boxShadow: '0 4px 0 0 var(--violet-deep)' }}>
                  <ArrowRight size={15} strokeWidth={2.4} /> Ôn tập ngay
                </button>
              </Link>
              <span style={{ fontSize: 12.5, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                ~15 phút
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
