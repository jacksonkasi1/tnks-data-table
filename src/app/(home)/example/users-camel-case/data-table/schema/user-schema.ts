import { z } from "zod";

/**
 * Zod schema for User entity with camelCase field names
 * 
 * This schema defines the structure of user data with camelCase formatting:
 * - createdAt instead of created_at
 * - expenseCount instead of expense_count  
 * - totalExpenses instead of total_expenses
 */
export const userCamelCaseSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  age: z.number(),
  createdAt: z.string(),
  expenseCount: z.number(),
  totalExpenses: z.string(),
});

export type UserCamelCase = z.infer<typeof userCamelCaseSchema>;

export const usersCamelCaseResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(userCamelCaseSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total_pages: z.number(),
    total_items: z.number(),
  }),
});