"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type RenameConversationFormState = {
  error?: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} size="sm" type="submit" variant="outline">
      {pending ? "Saving..." : "Rename"}
    </Button>
  );
}

export function RenameConversationForm({
  action,
  defaultValue,
}: {
  action: (
    state: RenameConversationFormState,
    formData: FormData,
  ) => Promise<RenameConversationFormState>;
  defaultValue: string;
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          defaultValue={defaultValue}
          maxLength={80}
          minLength={2}
          name="title"
          required
        />
        <SubmitButton />
      </div>

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
    </form>
  );
}
