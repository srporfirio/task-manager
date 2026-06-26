import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getUserAvatarUrl, getUserDisplayName, getUserInitials } from "../../lib/auth-user";

type UserMenuProps = {
  user: User;
  onSignOut: () => void;
};

export function UserMenu({ user, onSignOut }: UserMenuProps) {
  const displayName = getUserDisplayName(user);
  const avatarUrl = getUserAvatarUrl(user);
  const initials = getUserInitials(displayName);
  const [avatarFailed, setAvatarFailed] = useState(false);

  const showAvatarImage = Boolean(avatarUrl) && !avatarFailed;

  return (
    <div className="flex items-center gap-2.5 min-w-0">
      {showAvatarImage ? (
        <img
          src={avatarUrl!}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setAvatarFailed(true)}
          className="h-8 w-8 shrink-0 rounded-full object-cover opacity-90"
        />
      ) : (
        <span
          aria-hidden
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant text-[0.65rem] font-semibold"
        >
          {initials}
        </span>
      )}
      <p
        className="hidden md:block truncate max-w-[180px] text-label-md text-outline"
        title={user.email ?? ""}
      >
        {user.email}
      </p>
      <button
        type="button"
        onClick={onSignOut}
        title="Sair da conta"
        className="flex items-center gap-1 rounded-md px-1.5 py-1 text-label-md text-outline transition-colors hover:bg-surface-container-low hover:text-on-surface-variant"
      >
        <span className="material-symbols-outlined text-[1.1rem]">logout</span>
        <span className="hidden sm:inline">Sair</span>
      </button>
    </div>
  );
}
