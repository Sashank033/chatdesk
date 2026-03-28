"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ConversationFormState = {
  error?: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full sm:w-auto" disabled={pending} type="submit">
      {pending ? "Creating..." : "Create conversation"}
    </Button>
  );
}

export function CreateConversationForm({
  action,
}: {
  action: (
    state: ConversationFormState,
    formData: FormData,
  ) => Promise<ConversationFormState>;
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="mt-5 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          maxLength={80}
          name="title"
          placeholder="Optional title (defaults to New conversation)"
        />
        <SubmitButton />
      </div>

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
    </form>
  );
}
