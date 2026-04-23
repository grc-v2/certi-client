import type { Exam } from "../types/exam";

const TYPE_LABELS: Record<string, string> = {
  PRACTICE: "Luyện tập",
  MOCK: "Thi thử",
  FINAL: "Thi chính thức",
  DIAGNOSTIC: "Đánh giá đầu vào",
  TOPIC_WISE: "Theo chủ đề",
};

export function ExamList({ exams }: { exams: Exam[] }) {
  if (exams.length === 0) {
    return <p className="text-muted-foreground text-sm">Chưa có bài thi nào cho chứng chỉ này.</p>;
  }
  return (
    <ul className="flex flex-col gap-3">
      {exams.map((exam) => (
        <li
          key={exam.id}
          className="border-border bg-background hover:border-primary/40 flex flex-col gap-1 rounded-xl border p-4 transition-colors"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col">
              <h4 className="text-sm font-medium">{exam.title}</h4>
              {exam.description ? (
                <p className="text-muted-foreground line-clamp-2 text-xs">{exam.description}</p>
              ) : null}
            </div>
            <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap">
              {TYPE_LABELS[exam.type] ?? exam.type}
            </span>
          </div>
          <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {exam.durationMinutes ? <span>{exam.durationMinutes} phút</span> : null}
            {exam.totalQuestions ? <span>{exam.totalQuestions} câu</span> : null}
            {exam.passingScore ? <span>Đậu: {exam.passingScore}%</span> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
