import Link from "next/link";

import { Button } from "@/components/ui/button";
import { clientEnv } from "@/config/env";

export default function HomePage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="flex w-full max-w-2xl flex-col items-center gap-8 text-center">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            {clientEnv.NEXT_PUBLIC_APP_NAME}
          </h1>
          <p className="text-muted-foreground text-lg">
            Học tập, nghiên cứu và luyện thi chứng chỉ hiệu quả — từ đề mẫu đến phân tích điểm yếu,
            tất cả trong một nơi.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button render={<Link href="/register" />}>Bắt đầu miễn phí</Button>
          <Button variant="outline" render={<Link href="/certifications" />}>
            Khám phá chứng chỉ
          </Button>
        </div>
      </div>
    </main>
  );
}
