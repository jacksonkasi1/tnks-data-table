import { z } from "zod";

// Schema for users with expenses from the API
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

// Schema for expense data from API
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

// API response schemas
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