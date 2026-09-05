import type { RoleName } from "../lib/accounts";

// Colors are the role.* tokens from build/04-design/DESIGN_TOKENS.md.
const ROLE_CLASSES: Record<string, string> = {
  ADMIN: "bg-role-admin",
  MANAGER: "bg-role-manager",
  AUDITOR: "bg-role-auditor",
  USER: "bg-role-user",
};

export default function RoleBadge({
  role,
  className = "",
}: {
  role: RoleName | string;
  className?: string;
}) {
  const key = role.replace(/_ROLE$/, "");
  const color = ROLE_CLASSES[key] ?? "bg-slate-400";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white ${color} ${className}`}
    >
      {key}
    </span>
  );
}
