# Database Seeding Scripts

This directory contains scripts for seeding the database with sample data.

## Seed Script

The `seed.ts` script populates the database with:

- 10 random users with realistic data
- 3-8 expense records per user with random products and amounts

### How to Run

```bash
# Run the seed script
npm run seed
```

### What It Does

1. Connects to the database using the connection string in your `.env` file
2. Generates sample users with realistic names, emails, and phone numbers
3. For each user, creates several expense records with product names and prices
4. Outputs the results of each operation to the console

### Customizing

You can modify the `seed.ts` file to:

- Change the number of users generated
- Adjust the range of expenses per user
- Modify the types of data being generated
- Add additional data models as your schema evolves

## Notes

- Running this script multiple times will create duplicate data unless you clear the tables first
- All data is randomly generated using Faker.js
