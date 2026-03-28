const apiKey = process.env.OPENAI_API_KEY;
export const isOpenAIConfigured = Boolean(apiKey);

type OpenAIClient = {
  chat: {
    completions: {
      create: (params: {
        model: string;
        temperature: number;
        messages: Array<{
          role: "system" | "user" | "assistant";
          content: string;
        }>;
      }) => Promise<{
        choices: Array<{
          message?: {
            content?: string | null;
          };
        }>;
      }>;
    };
  };
};

let openai: OpenAIClient | null = null;

type ChatHistoryMessage = {
  role: "SYSTEM" | "USER" | "ASSISTANT";
  content: string;
};

export async function generateAssistantReply(messages: ChatHistoryMessage[]) {
  if (!isOpenAIConfigured) {
    throw new Error("OPENAI_API_KEY is not set.");
  }

  if (!openai) {
    const { default: OpenAI } = await import("openai");

    openai = new OpenAI({
      apiKey,
    });
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content:
          "You are ChatDesk, a helpful AI assistant inside a team workspace. Give clear, concise, helpful replies.",
      },
      ...messages.map((message) => ({
        role: message.role.toLowerCase() as "system" | "user" | "assistant",
        content: message.content,
      })),
    ],
  });

  const reply = completion.choices[0]?.message?.content?.trim();

  if (!reply) {
    throw new Error("OpenAI returned an empty response.");
  }

  return reply;
}
