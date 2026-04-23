import Link from "next/link";

import type { Certification } from "../types/certification";

const LEVEL_LABELS: Record<string, string> = {
  FOUNDATIONAL: "Cơ bản",
  ASSOCIATE: "Associate",
  PROFESSIONAL: "Professional",
  SPECIALTY: "Specialty",
  EXPERT: "Expert",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  BEGINNER: "Mới bắt đầu",
  INTERMEDIATE: "Trung cấp",
  ADVANCED: "Nâng cao",
  EXPERT: "Chuyên gia",
};

function formatPrice(price: string | null | undefined): string | null {
  if (!price) return null;
  const amount = Number(price);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

export function CertificationCard({ certification }: { certification: Certification }) {
  const price = formatPrice(certification.price);
  const level = certification.level
    ? (LEVEL_LABELS[certification.level] ?? certification.level)
    : null;
  const difficulty = certification.difficultyLevel
    ? (DIFFICULTY_LABELS[certification.difficultyLevel] ?? certification.difficultyLevel)
    : null;

  return (
    <Link
      href={`/certifications/${certification.slug}`}
      className="border-border bg-card hover:border-primary/40 group flex flex-col gap-3 rounded-2xl border p-5 transition-colors hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {certification.provider ?? "—"}
          </p>
          <h3 className="group-hover:text-primary text-base leading-tight font-semibold">
            {certification.name}
          </h3>
          <p className="text-muted-foreground text-xs">{certification.code}</p>
        </div>
        {level ? (
          <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap">
            {level}
          </span>
        ) : null}
      </div>

      {certification.tagline ? (
        <p className="text-muted-foreground line-clamp-2 text-sm">{certification.tagline}</p>
      ) : null}

      <div className="text-muted-foreground mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        {difficulty ? <span>{difficulty}</span> : null}
        {certification.durationMinutes ? <span>{certification.durationMinutes} phút</span> : null}
        {certification.totalQuestions ? <span>{certification.totalQuestions} câu</span> : null}
        {price ? <span className="text-foreground font-medium">{price}</span> : null}
      </div>
    </Link>
  );
}
