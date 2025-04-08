import { faker } from "@faker-js/faker";

// ** DB
import { db } from "@/db";

// ** Table
import { NewUser, users } from "@/db/schema/tbl_users";
import { NewExpense, expenses } from "@/db/schema/tbl_expenses";

/**
 * Generate a random date within the last year
 */
function getRandomDateInPastYear() {
  // Get date from 1 year ago to today
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);
  
  return faker.date.between({ from: oneYearAgo, to: today });
}

/**
 * Generate a date after the given date, but not more than 6 months later
 */
function getRandomFutureDate(fromDate: Date) {
  const sixMonthsLater = new Date(fromDate);
  sixMonthsLater.setMonth(fromDate.getMonth() + 6);
  
  // Ensure we don't create dates in the future beyond today
  const today = new Date();
  const maxDate = sixMonthsLater > today ? today : sixMonthsLater;
  
  return faker.date.between({ from: fromDate, to: maxDate });
}

async function main() {
  console.log("🌱 Starting seed process...");

  // Generate 200 users
  const userData: NewUser[] = Array.from({ length: 200 }).map(() => {
    // Create a random creation date within the past year
    const createdAt = getRandomDateInPastYear();
    
    // Create a random update date that's after the creation date
    const updatedAt = getRandomFutureDate(createdAt);
    
    return {
      name: faker.person.fullName(),
      age: faker.number.int({ min: 18, max: 80 }),
      email: faker.internet.email().toLowerCase(),
      phone: faker.phone.number(),
      created_at: createdAt,
      updated_at: updatedAt
    };
  });

  console.log("🧑‍🤝‍🧑 Inserting users...");
  const insertedUsers = await db.insert(users).values(userData).returning();
  console.log(`✅ Successfully inserted ${insertedUsers.length} users`);

  // Generate 3-8 expenses for each user
  const expenseData: NewExpense[] = [];

  for (const user of insertedUsers) {
    // Random number of expenses per user (between 3 and 8)
    const expenseCount = faker.number.int({ min: 3, max: 8 });
    
    // Use user's creation date as the earliest possible date for expenses
    const userCreatedAt = user.created_at instanceof Date 
      ? user.created_at 
      : new Date(user.created_at);

    for (let i = 0; i < expenseCount; i++) {
      // Generate expense dates after the user was created, but varied
      // For a more realistic pattern, make some expenses more recent
      let expenseDate;
      
      if (i < expenseCount / 2) {
        // Half the expenses are more recent (last 30 days)
        expenseDate = faker.date.recent({ days: 30 });
        
        // Ensure expense date is after user creation
        if (expenseDate < userCreatedAt) {
          expenseDate = faker.date.between({ 
            from: userCreatedAt, 
            to: new Date() 
          });
        }
      } else {
        // The rest are spread out since user creation
        expenseDate = faker.date.between({ 
          from: userCreatedAt, 
          to: new Date()
        });
      }
      
      // Create expense with varied dates
      expenseData.push({
        user_id: user.id,
        expense_name: faker.commerce.productName(),
        amount: faker.commerce.price({ min: 10, max: 500 }),
        expense_date: expenseDate,
        created_at: expenseDate, // Expense created same day as the expense date
        updated_at: getRandomFutureDate(expenseDate) // Maybe updated later
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
