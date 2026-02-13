import { Info } from "lucide-react";

interface PageHint {
  title: string;
  items: string[];
}

interface AdminPageLayoutProps {
  children: React.ReactNode;
  hint?: PageHint;
}

export function AdminPageLayout({ children, hint }: AdminPageLayoutProps) {
  return (
    <div className="flex items-start gap-6">
      <div className="min-w-0 flex-1">{children}</div>
      {hint && (
        <div className="sticky top-6 hidden w-[280px] shrink-0 2xl:block">
          <div className="rounded-lg border border-[#d8e2f8] bg-[#f0f4ff] p-5">
            <div className="mb-3 flex items-center gap-2">
              <Info size={14} className="shrink-0 text-[#1a73e8]" />
              <h3 className="text-[13px] font-medium text-[#202124]">{hint.title}</h3>
            </div>
            <ul className="space-y-2">
              {hint.items.map((item, i) => (
                <li key={i} className="flex gap-2 text-[12px] leading-relaxed text-[#5f6368]">
                  <span className="mt-0.5 shrink-0 text-[#1a73e8]/50">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
