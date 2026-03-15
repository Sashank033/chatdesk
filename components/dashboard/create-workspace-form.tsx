"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type WorkspaceFormState = {
  error?: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full sm:w-auto" disabled={pending} type="submit">
      {pending ? "Creating..." : "Create workspace"}
    </Button>
  );
}

export function CreateWorkspaceForm({
  action,
}: {
  action: (state: WorkspaceFormState, formData: FormData) => Promise<WorkspaceFormState>;
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          required
          maxLength={50}
          minLength={2}
          name="name"
          placeholder="Workspace name"
        />
        <SubmitButton />
      </div>

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
    </form>
  );
}
