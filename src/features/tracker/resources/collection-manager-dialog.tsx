import { useState, type CSSProperties } from 'react'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { TrackerModal } from '@/components/tracker/tracker-modal'
import { useCollections, useCreateCollection, useRenameCollection, useDeleteCollection } from '@/hooks/queries/tracker-collections'

interface CollectionManagerDialogProps {
  open: boolean
  onClose: () => void
}

export function CollectionManagerDialog({ open, onClose }: CollectionManagerDialogProps) {
  const { data: collections = [] } = useCollections()
  const createCollection = useCreateCollection()
  const renameCollection = useRenameCollection()
  const deleteCollection = useDeleteCollection()

  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')

  function add() {
    const name = newName.trim()
    if (!name || createCollection.isPending) return
    createCollection.mutate(name, { onSuccess: () => setNewName('') })
  }

  function saveRename(id: number) {
    const name = editName.trim()
    if (!name) return
    renameCollection.mutate({ id, name }, { onSuccess: () => setEditingId(null) })
  }

  return (
    <TrackerModal open={open} title="Quản lý nhóm" onClose={onClose}>
      <div className="row" style={{ gap: 8 }}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="Tên nhóm mới…"
          style={inputStyle}
        />
        <button onClick={add} disabled={!newName.trim()} className="btn3d sm"><Plus size={15} /> Thêm</button>
      </div>

      <div className="col scroll-area" style={{ gap: 6, maxHeight: 320, overflowY: 'auto' }}>
        {collections.length === 0 ? (
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-3)', padding: '12px 0' }}>Chưa có nhóm nào.</p>
        ) : (
          collections.map((c) =>
            editingId === c.id ? (
              <div key={c.id} className="row" style={{ gap: 6, alignItems: 'center' }}>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus onKeyDown={(e) => e.key === 'Enter' && saveRename(c.id)} style={inputStyle} />
                <button onClick={() => setEditingId(null)} className="iconbtn" title="Huỷ" style={smallBtn}><X size={15} /></button>
                <button onClick={() => saveRename(c.id)} className="iconbtn" title="Lưu" style={{ ...smallBtn, color: 'var(--brand-deep)' }}><Check size={15} /></button>
              </div>
            ) : (
              <div key={c.id} className="row" style={{ gap: 8, alignItems: 'center', padding: '8px 10px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{c.name}</span>
                <button onClick={() => { setEditingId(c.id); setEditName(c.name) }} className="iconbtn" title="Đổi tên" style={smallBtn}><Pencil size={15} /></button>
                <button
                  onClick={() => { if (window.confirm(`Xoá nhóm "${c.name}"? Tài nguyên trong nhóm sẽ về "Không nhóm".`)) deleteCollection.mutate(c.id) }}
                  className="iconbtn" title="Xoá" style={{ ...smallBtn, color: 'var(--hard)' }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ),
          )
        )}
      </div>
    </TrackerModal>
  )
}

const inputStyle: CSSProperties = {
  flex: 1, minWidth: 0, height: 38, padding: '0 12px', fontSize: 13.5, color: 'var(--ink)',
  background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', outline: 'none', fontFamily: 'inherit',
}
const smallBtn: CSSProperties = { width: 30, height: 30, borderRadius: 'var(--radius-xs)' }

export default CollectionManagerDialog
