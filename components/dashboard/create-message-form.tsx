"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

type MessageFormState = {
  error?: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full sm:w-auto" disabled={pending} type="submit">
      {pending ? "Sending..." : "Send message"}
    </Button>
  );
}

export function CreateMessageForm({
  action,
}: {
  action: (state: MessageFormState, formData: FormData) => Promise<MessageFormState>;
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-3">
      <textarea
        required
        maxLength={4000}
        minLength={1}
        name="content"
        placeholder="Type your message here..."
        className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex min-h-32 w-full rounded-md border bg-transparent px-3 py-3 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px]"
      />

      <div className="flex justify-end">
        <SubmitButton />
      </div>

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
    </form>
  );
}
