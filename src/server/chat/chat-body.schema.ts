import { z } from "zod";

const responseColors = z.enum([
  "blue",
  "yellow",
  "orange",
  "white",
  "grey",
  "black",
  "red",
  "green",
  "amber",
]);

export const chatBodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(8000),
      }),
    )
    .max(50),
  userInput: z.string().max(4000),
  colorHint: responseColors,
});

export type ChatBodyInput = z.infer<typeof chatBodySchema>;
