"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

type SignOutButtonProps = {
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
};

export function SignOutButton({
  className,
  variant = "outline",
}: SignOutButtonProps) {
  return (
    <Button
      className={className}
      onClick={() => signOut({ callbackUrl: "/" })}
      type="button"
      variant={variant}
    >
      Sign out
    </Button>
  );
}
