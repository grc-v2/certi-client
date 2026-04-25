import type { Metadata } from "next";

export const metadata: Metadata = { title: "Tổng quan" };

const MODULES = [
  { name: "Người dùng", status: "Phase 1", desc: "Danh sách, phiên đăng nhập, vô hiệu hoá" },
  { name: "Chứng chỉ", status: "Phase 2", desc: "CRUD + domain weight + workflow trạng thái" },
  {
    name: "Ngân hàng câu hỏi",
    status: "Phase 3–4",
    desc: "Versioning, import/export, review & publish",
  },
  { name: "Thông báo", status: "Phase 5", desc: "Template, broadcast, lịch sử gửi" },
  { name: "Nhật ký hoạt động", status: "Phase 1", desc: "Truy vết mọi thao tác admin" },
];

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Bảng điều khiển quản trị</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Các module đang được triển khai theo kế hoạch Phase 0 → 6.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((m) => (
          <div
            key={m.name}
            className="border-border bg-card rounded-lg border p-4 shadow-sm transition-shadow hover:shadow"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">{m.name}</div>
              <span className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs">
                {m.status}
              </span>
            </div>
            <p className="text-muted-foreground mt-2 text-xs">{m.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
