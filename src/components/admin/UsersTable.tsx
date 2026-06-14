"use client";

import { useActionState } from "react";
import { cn } from "@/lib/utils";
import {
  setUserActive,
  type UserActionState,
} from "@/app/dashboard/admin/usuarios/actions";
import type { Role } from "@/lib/auth/dal";

export interface UserRow {
  id: string;
  full_name: string;
  email: string | null;
  role: Role;
  active: boolean;
  created_at: string;
}

const roleLabel: Record<Role, string> = {
  socio: "Sócio",
  advogado: "Advogado",
  estagiario: "Estagiário",
};

export function UsersTable({
  users,
  currentUserId,
}: {
  users: UserRow[];
  currentUserId: string;
}) {
  if (users.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-paper p-6 text-sm text-muted shadow-soft">
        Nenhum associado cadastrado ainda.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-paper shadow-soft">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-xs uppercase tracking-wide text-muted">
            <th className="px-4 py-3 font-medium">Associado</th>
            <th className="px-4 py-3 font-medium">Papel</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Ação</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <UserRowItem
              key={user.id}
              user={user}
              isSelf={user.id === currentUserId}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UserRowItem({ user, isSelf }: { user: UserRow; isSelf: boolean }) {
  const [, action, pending] = useActionState(
    setUserActive,
    {} as UserActionState,
  );

  return (
    <tr className="border-t border-line">
      <td className="px-4 py-3">
        <p className="font-medium text-ink">{user.full_name || "—"}</p>
        <p className="text-xs text-muted">{user.email}</p>
      </td>
      <td className="px-4 py-3 text-muted">{roleLabel[user.role] ?? user.role}</td>
      <td className="px-4 py-3">
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-medium",
            user.active ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700",
          )}
        >
          {user.active ? "Ativo" : "Inativo"}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        {isSelf ? (
          <span className="text-xs text-muted">você</span>
        ) : (
          <form action={action} className="inline">
            <input type="hidden" name="id" value={user.id} />
            <input type="hidden" name="active" value={user.active ? "false" : "true"} />
            <button
              type="submit"
              disabled={pending}
              className="text-xs font-medium text-green-700 transition-colors hover:text-green-800 disabled:opacity-60"
            >
              {pending ? "…" : user.active ? "Desativar" : "Reativar"}
            </button>
          </form>
        )}
      </td>
    </tr>
  );
}
