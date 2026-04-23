import type { CertificationDomain } from "../types/domain";

function formatWeight(weight: string | null | undefined): string | null {
  if (!weight) return null;
  const num = Number(weight);
  if (!Number.isFinite(num) || num <= 0) return null;
  return `${num}%`;
}

function DomainNode({ domain, depth = 0 }: { domain: CertificationDomain; depth?: number }) {
  const weight = formatWeight(domain.weightPercentage);
  const hasChildren = Array.isArray(domain.children) && domain.children.length > 0;
  return (
    <li className="border-border border-l pl-4" style={{ marginLeft: depth * 12 }}>
      <div className="flex items-start justify-between gap-3 py-2">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium">{domain.name}</h4>
            {domain.code ? (
              <span className="text-muted-foreground text-xs">{domain.code}</span>
            ) : null}
          </div>
          {domain.description ? (
            <p className="text-muted-foreground text-xs">{domain.description}</p>
          ) : null}
        </div>
        {weight ? (
          <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap">
            {weight}
          </span>
        ) : null}
      </div>
      {hasChildren ? (
        <ul className="flex flex-col">
          {domain.children!.map((child) => (
            <DomainNode key={child.id} domain={child} depth={depth + 1} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function DomainTree({ domains }: { domains: CertificationDomain[] }) {
  if (domains.length === 0) {
    return <p className="text-muted-foreground text-sm">Chưa có thông tin domain.</p>;
  }
  return (
    <ul className="flex flex-col">
      {domains.map((domain) => (
        <DomainNode key={domain.id} domain={domain} />
      ))}
    </ul>
  );
}
