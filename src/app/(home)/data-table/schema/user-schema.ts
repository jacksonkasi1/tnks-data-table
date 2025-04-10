import { z } from "zod";

export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  age: z.number(),
  created_at: z.string(),
  expense_count: z.number(),
  total_expenses: z.string(),
});

export type User = z.infer<typeof userSchema>;

export const usersResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(userSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total_pages: z.number(),
    total_items: z.number(),
  }),
}); 