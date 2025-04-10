import { z } from "zod";

// ** Import Schema
import { userSchema } from "./user-schema";

export const expenseSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  expense_name: z.string(),
  amount: z.string(),
  expense_date: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Expense = z.infer<typeof expenseSchema>;

export const userExpensesResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    user: userSchema,
    expenses: z.array(expenseSchema),
    stats: z.object({
      total_amount: z.string(),
      avg_amount: z.string(),
      max_amount: z.string(),
      min_amount: z.string(),
    }),
  }),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total_pages: z.number(),
    total_items: z.number(),
  }),
}); 