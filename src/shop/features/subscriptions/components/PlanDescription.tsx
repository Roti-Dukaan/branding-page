import { cn } from "@shop/lib/utils";

const BULLET_RE = /^[-*•]\s+/;

export function parsePlanDescription(description: string) {
  const lines = description
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const intro: string[] = [];
  const bullets: string[] = [];

  for (const line of lines) {
    if (BULLET_RE.test(line)) {
      bullets.push(line.replace(BULLET_RE, ""));
    } else {
      intro.push(line);
    }
  }

  return { intro, bullets };
}

type PlanDescriptionProps = {
  description?: string | null;
  className?: string;
  listClassName?: string;
};

export function PlanDescription({
  description,
  className,
  listClassName,
}: PlanDescriptionProps) {
  const text = description?.trim();
  if (!text) return null;

  const { intro, bullets } = parsePlanDescription(text);

  if (bullets.length === 0) {
    return <p className={className}>{text}</p>;
  }

  return (
    <div className={className}>
      {intro.map((line, index) => (
        <p key={`intro-${index}`} className={index > 0 ? "mt-1" : undefined}>
          {line}
        </p>
      ))}
      <ul
        className={cn(
          "list-disc space-y-1 pl-5",
          intro.length > 0 && "mt-2",
          listClassName
        )}
      >
        {bullets.map((line, index) => (
          <li key={`bullet-${index}`}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
