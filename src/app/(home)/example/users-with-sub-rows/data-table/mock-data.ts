// Mock data with hierarchical structure for demonstrating sub-rows
export interface UserWithExpenses {
  id: number;
  name: string;
  email: string;
  department: string;
  totalExpenses: number;
  subRows?: ExpenseRecord[];
  [key: string]: string | number | boolean | null | undefined | ExpenseRecord[];
}

export interface ExpenseRecord {
  id: number;
  expenseName: string;
  amount: number;
  date: string;
  category: string;
  parentUserId: number;
  [key: string]: string | number | boolean | null | undefined;
}

// Sample data with users and their expense records as sub-rows
export const mockUsersWithExpenses: UserWithExpenses[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@company.com",
    department: "Engineering",
    totalExpenses: 2450.75,
    subRows: [
      {
        id: 101,
        expenseName: "Business Travel",
        amount: 1200.00,
        date: "2024-01-15",
        category: "Travel",
        parentUserId: 1
      },
      {
        id: 102,
        expenseName: "Software License",
        amount: 850.00,
        date: "2024-01-20",
        category: "Software",
        parentUserId: 1
      },
      {
        id: 103,
        expenseName: "Conference Ticket",
        amount: 400.75,
        date: "2024-02-05",
        category: "Training",
        parentUserId: 1
      }
    ]
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@company.com",
    department: "Marketing",
    totalExpenses: 1875.50,
    subRows: [
      {
        id: 201,
        expenseName: "Marketing Campaign",
        amount: 1500.00,
        date: "2024-01-10",
        category: "Marketing",
        parentUserId: 2
      },
      {
        id: 202,
        expenseName: "Design Tools",
        amount: 375.50,
        date: "2024-01-25",
        category: "Software",
        parentUserId: 2
      }
    ]
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike.johnson@company.com", 
    department: "Sales",
    totalExpenses: 0,
    subRows: [] // User with no expenses
  },
  {
    id: 4,
    name: "Sarah Wilson",
    email: "sarah.wilson@company.com",
    department: "HR",
    totalExpenses: 825.25,
    subRows: [
      {
        id: 401,
        expenseName: "Recruitment Event",
        amount: 600.00,
        date: "2024-02-01",
        category: "Events",
        parentUserId: 4
      },
      {
        id: 402,
        expenseName: "HR Software",
        amount: 225.25,
        date: "2024-02-10",
        category: "Software",
        parentUserId: 4
      }
    ]
  },
  {
    id: 5,
    name: "David Brown",
    email: "david.brown@company.com",
    department: "Engineering", 
    totalExpenses: 3200.00,
    subRows: [
      {
        id: 501,
        expenseName: "Hardware Purchase",
        amount: 2000.00,
        date: "2024-01-05",
        category: "Hardware",
        parentUserId: 5
      },
      {
        id: 502,
        expenseName: "Cloud Services",
        amount: 800.00,
        date: "2024-01-30",
        category: "Cloud",
        parentUserId: 5
      },
      {
        id: 503,
        expenseName: "Development Tools",
        amount: 400.00,
        date: "2024-02-15",
        category: "Software",
        parentUserId: 5
      }
    ]
  }
];

// Function to extract sub-rows (expenses) from a user row
export const getUserExpenses = (user: UserWithExpenses): ExpenseRecord[] | undefined => {
  return user.subRows;
};

// Mock API function that simulates fetching user data with expenses
export const fetchUsersWithExpenses = async (): Promise<{
  success: boolean;
  data: UserWithExpenses[];
  pagination: {
    page: number;
    limit: number;
    total_pages: number;
    total_items: number;
  };
}> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // CRITICAL FIX: Ensure subRows are directly accessible for TanStack Table
  const dataWithDirectSubRows = mockUsersWithExpenses.map(user => ({
    ...user,
    // TanStack Table expects subRows to be directly accessible
    subRows: user.subRows || []
  }));

  return {
    success: true,
    data: dataWithDirectSubRows,
    pagination: {
      page: 1,
      limit: 50,
      total_pages: 1,
      total_items: mockUsersWithExpenses.length
    }
  };
};

// Simple function to fetch users for the basic data table
export const fetchUsers = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    data: mockUsersWithExpenses.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      department: user.department,
      totalExpenses: user.totalExpenses
    })),
    pagination: {
      page: 1,
      limit: 10,
      total_pages: Math.ceil(mockUsersWithExpenses.length / 10),
      total_items: mockUsersWithExpenses.length
    }
  };
};