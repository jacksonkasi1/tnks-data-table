import { faker } from "@faker-js/faker";

// ** DB
import { db } from "@/db";

// ** Table
import { NewUser, users } from "@/db/schema/tbl_users";
import { NewExpense, expenses } from "@/db/schema/tbl_expenses";
import { NewOrder, orders } from "@/db/schema/tbl_orders";
import { NewOrderItem, orderItems } from "@/db/schema/tbl_order_items";

// ** Import booking seeds
import { seedBookings } from "@/db/seed/seed-bookings";

// ** Import ticket seeds
import { seedTickets } from "@/db/seed/seed-tickets";

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

  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await db.delete(expenses);
  await db.delete(orderItems);
  await db.delete(orders);
  await db.delete(users);
  console.log("✅ Existing data cleared");

  // Generate 10,000 users
  const userData: NewUser[] = [];
  const usedEmails = new Set<string>();
  
  for (let i = 0; i < 10000; i++) {
    // Create a random creation date within the past year
    const createdAt = getRandomDateInPastYear();
    
    // Create a random update date that's after the creation date
    const updatedAt = getRandomFutureDate(createdAt);
    
    // Generate unique email
    let email = faker.internet.email().toLowerCase();
    while (usedEmails.has(email)) {
      email = faker.internet.email().toLowerCase();
    }
    usedEmails.add(email);
    
    userData.push({
      name: faker.person.fullName(),
      age: faker.number.int({ min: 18, max: 80 }),
      email,
      phone: faker.phone.number(),
      created_at: createdAt,
      updated_at: updatedAt
    });
  }

  console.log("🧑‍🤝‍🧑 Inserting users...");
  const insertedUsers: typeof users.$inferSelect[] = [];
  const batchSize = 500;
  
  for (let i = 0; i < userData.length; i += batchSize) {
    const batch = userData.slice(i, i + batchSize);
    const result = await db.insert(users).values(batch).returning();
    insertedUsers.push(...result);
    console.log(`   Inserted ${insertedUsers.length}/${userData.length} users`);
  }
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
  const insertedExpenses: typeof expenses.$inferSelect[] = [];
  const expenseBatchSize = 1000;
  
  for (let i = 0; i < expenseData.length; i += expenseBatchSize) {
    const batch = expenseData.slice(i, i + expenseBatchSize);
    const result = await db.insert(expenses).values(batch).returning();
    insertedExpenses.push(...result);
    console.log(`   Inserted ${insertedExpenses.length}/${expenseData.length} expenses`);
  }
  console.log(`✅ Successfully inserted ${insertedExpenses.length} expenses`);

  // Generate 10,000 orders with 1-25 items each
  const orderData: NewOrder[] = [];
  const orderItemData: NewOrderItem[] = [];

  const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
  const paymentMethods = ["Credit Card", "Debit Card", "PayPal", "Bank Transfer", "Cash on Delivery"];

  const products = [
    { name: "Laptop", price: { min: 500, max: 2000 } },
    { name: "Mouse", price: { min: 10, max: 80 } },
    { name: "Keyboard", price: { min: 30, max: 200 } },
    { name: "Monitor", price: { min: 150, max: 800 } },
    { name: "Headphones", price: { min: 20, max: 300 } },
    { name: "Webcam", price: { min: 30, max: 150 } },
    { name: "USB Cable", price: { min: 5, max: 25 } },
    { name: "Phone Case", price: { min: 10, max: 50 } },
    { name: "Screen Protector", price: { min: 5, max: 30 } },
    { name: "Power Bank", price: { min: 20, max: 100 } },
    { name: "SSD Drive", price: { min: 50, max: 300 } },
    { name: "RAM Module", price: { min: 30, max: 200 } },
    { name: "Graphics Card", price: { min: 200, max: 1500 } },
    { name: "Motherboard", price: { min: 100, max: 500 } },
    { name: "CPU Processor", price: { min: 150, max: 800 } },
  ];

  console.log("🛒 Generating orders...");

  for (let i = 1; i <= 10000; i++) {
    const orderId = `ORD-${String(i).padStart(5, '0')}`;
    const orderDate = getRandomDateInPastYear();
    const itemCount = faker.number.int({ min: 1, max: 25 });

    let totalAmount = 0;
    const items: NewOrderItem[] = [];

    // Generate items for this order
    for (let j = 0; j < itemCount; j++) {
      const product = faker.helpers.arrayElement(products);
      const quantity = faker.number.int({ min: 1, max: 5 });
      const price = faker.number.float({
        min: product.price.min,
        max: product.price.max,
        fractionDigits: 2
      });
      const subtotal = quantity * price;
      totalAmount += subtotal;

      items.push({
        order_id: orderId,
        product_name: product.name,
        quantity,
        price: price.toFixed(2),
        subtotal: subtotal.toFixed(2),
      });
    }

    orderData.push({
      order_id: orderId,
      customer_name: faker.person.fullName(),
      customer_email: faker.internet.email().toLowerCase(),
      order_date: orderDate,
      status: faker.helpers.arrayElement(statuses),
      total_items: itemCount,
      total_amount: totalAmount.toFixed(2),
      shipping_address: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.state()} ${faker.location.zipCode()}`,
      payment_method: faker.helpers.arrayElement(paymentMethods),
      created_at: orderDate,
      updated_at: getRandomFutureDate(orderDate),
    });

    orderItemData.push(...items);
  }

  console.log("📦 Inserting orders...");
  const insertedOrders: typeof orders.$inferSelect[] = [];
  const orderBatchSize = 500;
  
  for (let i = 0; i < orderData.length; i += orderBatchSize) {
    const batch = orderData.slice(i, i + orderBatchSize);
    const result = await db.insert(orders).values(batch).returning();
    insertedOrders.push(...result);
    console.log(`   Inserted ${insertedOrders.length}/${orderData.length} orders`);
  }
  console.log(`✅ Successfully inserted ${insertedOrders.length} orders`);

  console.log("📋 Inserting order items...");
  const insertedOrderItems: typeof orderItems.$inferSelect[] = [];
  const orderItemBatchSize = 2000;
  
  for (let i = 0; i < orderItemData.length; i += orderItemBatchSize) {
    const batch = orderItemData.slice(i, i + orderItemBatchSize);
    const result = await db.insert(orderItems).values(batch).returning();
    insertedOrderItems.push(...result);
    console.log(`   Inserted ${insertedOrderItems.length}/${orderItemData.length} order items`);
  }
  console.log(`✅ Successfully inserted ${insertedOrderItems.length} order items`);

  // Seed bookings
  await seedBookings();

  // Seed tickets
  await seedTickets();

  console.log("🎉 Seed process completed!");
  process.exit(0);
}

main().catch((error) => {
  console.error("❌ Error during seed process:", error);
  process.exit(1);
});
