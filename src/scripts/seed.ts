import { faker } from "@faker-js/faker";

// ** DB
import { db } from "@/db";

// ** Table
import { NewUser, users } from "@/db/schema/tbl_users";
import { NewExpense, expenses } from "@/db/schema/tbl_expenses";

async function main() {
  console.log("🌱 Starting seed process...");

  // Generate 100 users
  const userData: NewUser[] = Array.from({ length: 100 }).map(() => ({
    name: faker.person.fullName(),
    age: faker.number.int({ min: 18, max: 80 }),
    email: faker.internet.email().toLowerCase(),
    phone: faker.phone.number(),
  }));

  console.log("🧑‍🤝‍🧑 Inserting users...");
  const insertedUsers = await db.insert(users).values(userData).returning();
  console.log(`✅ Successfully inserted ${insertedUsers.length} users`);

  // Generate 3-8 expenses for each user
  const expenseData: NewExpense[] = [];

  for (const user of insertedUsers) {
    // Random number of expenses per user (between 3 and 8)
    const expenseCount = faker.number.int({ min: 3, max: 8 });

    for (let i = 0; i < expenseCount; i++) {
      expenseData.push({
        user_id: user.id,
        expense_name: faker.commerce.productName(),
        amount: faker.commerce.price({ min: 10, max: 500 }),
        expense_date: faker.date.recent({ days: 90 }),
      });
    }
  }

  console.log("💰 Inserting expenses...");
  const insertedExpenses = await db
    .insert(expenses)
    .values(expenseData)
    .returning();
  console.log(`✅ Successfully inserted ${insertedExpenses.length} expenses`);

  console.log("🎉 Seed process completed!");
  process.exit(0);
}

main().catch((error) => {
  console.error("❌ Error during seed process:", error);
  process.exit(1);
});
