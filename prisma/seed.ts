import { PrismaClient, MealCategory, HealthTag, PaymentMethod, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const meals = [
  ["Samosa", "samosa", "Crispy potato-filled pastry.", MealCategory.SNACKS, 25, HealthTag.OCCASIONAL, "Cookie"],
  ["Bread Pakoda", "bread-pakoda", "Stuffed fried bread snack.", MealCategory.SNACKS, 30, HealthTag.OCCASIONAL, "Cookie"],
  ["Aloo Patty", "aloo-patty", "Golden potato patty.", MealCategory.SNACKS, 28, HealthTag.BALANCED, "Cookie"],
  ["Veg Sandwich", "veg-sandwich", "Whole wheat veggie sandwich.", MealCategory.MEALS, 45, HealthTag.HEALTHY, "UtensilsCrossed"],
  ["Paneer Sandwich", "paneer-sandwich", "Protein-rich paneer sandwich.", MealCategory.MEALS, 60, HealthTag.BALANCED, "UtensilsCrossed"],
  ["Noodles", "noodles", "Indo-chinese veg noodles.", MealCategory.MEALS, 55, HealthTag.OCCASIONAL, "UtensilsCrossed"],
  ["Pasta", "pasta", "Tomato basil penne pasta.", MealCategory.MEALS, 65, HealthTag.BALANCED, "UtensilsCrossed"],
  ["Rajma Chawal", "rajma-chawal", "Kidney beans with rice.", MealCategory.MEALS, 70, HealthTag.HEALTHY, "UtensilsCrossed"],
  ["Chole Bhature", "chole-bhature", "Classic north Indian combo.", MealCategory.MEALS, 80, HealthTag.OCCASIONAL, "UtensilsCrossed"],
  ["Poha", "poha", "Light flattened rice breakfast.", MealCategory.HEALTHY, 35, HealthTag.HEALTHY, "Apple"],
  ["Upma", "upma", "Semolina breakfast bowl.", MealCategory.HEALTHY, 35, HealthTag.HEALTHY, "Apple"],
  ["Idli", "idli", "Steamed rice cakes.", MealCategory.HEALTHY, 40, HealthTag.HEALTHY, "Apple"],
  ["Dosa", "dosa", "Crispy dosa with chutney.", MealCategory.MEALS, 50, HealthTag.BALANCED, "UtensilsCrossed"],
  ["Vada Pav", "vada-pav", "Mumbai's iconic burger.", MealCategory.SNACKS, 35, HealthTag.OCCASIONAL, "Cookie"],
  ["Pav Bhaji", "pav-bhaji", "Spiced vegetable mash with pav.", MealCategory.MEALS, 70, HealthTag.BALANCED, "UtensilsCrossed"],
  ["Maggi", "maggi", "Instant masala noodles.", MealCategory.SNACKS, 40, HealthTag.OCCASIONAL, "Cookie"],
  ["Cold Coffee", "cold-coffee", "Chilled coffee drink.", MealCategory.BEVERAGES, 55, HealthTag.OCCASIONAL, "Coffee"],
  ["Milkshake", "milkshake", "Creamy vanilla shake.", MealCategory.BEVERAGES, 60, HealthTag.OCCASIONAL, "Coffee"],
  ["Lemonade", "lemonade", "Fresh mint lemonade.", MealCategory.BEVERAGES, 30, HealthTag.HEALTHY, "GlassWater"],
  ["Tea", "tea", "Indian masala chai.", MealCategory.BEVERAGES, 20, HealthTag.BALANCED, "Coffee"],
  ["Coffee", "coffee", "Hot brewed coffee.", MealCategory.BEVERAGES, 25, HealthTag.BALANCED, "Coffee"],
  ["Water Bottle", "water-bottle", "500ml packaged water.", MealCategory.BEVERAGES, 20, HealthTag.HEALTHY, "GlassWater"],
  ["Orange Juice", "orange-juice", "Fresh orange juice.", MealCategory.BEVERAGES, 45, HealthTag.HEALTHY, "GlassWater"],
  ["Fruit Bowl", "fruit-bowl", "Seasonal fruits.", MealCategory.HEALTHY, 55, HealthTag.HEALTHY, "Apple"],
  ["Salad Bowl", "salad-bowl", "Mixed vegetable salad.", MealCategory.HEALTHY, 50, HealthTag.HEALTHY, "Apple"],
  ["Biscuits", "biscuits", "Whole grain biscuits.", MealCategory.SNACKS, 15, HealthTag.BALANCED, "Cookie"],
  ["Muffin", "muffin", "Chocolate muffin.", MealCategory.DESSERTS, 40, HealthTag.OCCASIONAL, "CakeSlice"],
  ["Brownie", "brownie", "Fudgy brownie square.", MealCategory.DESSERTS, 45, HealthTag.OCCASIONAL, "CakeSlice"],
  ["Ice Cream Cup", "ice-cream-cup", "Single serve ice cream.", MealCategory.DESSERTS, 50, HealthTag.OCCASIONAL, "IceCreamCone"],
  ["Banana Shake", "banana-shake", "Banana milkshake.", MealCategory.BEVERAGES, 55, HealthTag.BALANCED, "Coffee"],
  ["Sprouts Chaat", "sprouts-chaat", "High-protein chaat.", MealCategory.HEALTHY, 45, HealthTag.HEALTHY, "Apple"],
  ["Corn Chaat", "corn-chaat", "Sweet corn with spices.", MealCategory.HEALTHY, 40, HealthTag.HEALTHY, "Apple"],
] as const;

async function main() {
  await prisma.rfidScanEvent.deleteMany();
  await prisma.transactionItem.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.parentStudentLink.deleteMany();
  await prisma.studentAccount.deleteMany();
  await prisma.mealItem.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  const cashier = await prisma.user.create({ data: { name: "Cashier One", email: "cashier@wildcard.edu", passwordHash, role: Role.CASHIER } });
  const parent = await prisma.user.create({ data: { name: "Priya Sharma", email: "parent@wildcard.edu", passwordHash, role: Role.PARENT } });
  await prisma.user.create({ data: { name: "Admin", email: "admin@wildcard.edu", passwordHash, role: Role.ADMIN } });

  const students = await Promise.all([
    prisma.user.create({ data: { name: "Aarav Sharma", email: "aarav@wildcard.edu", passwordHash, role: Role.STUDENT, wildCardId: "WC-STU-1001" } }),
    prisma.user.create({ data: { name: "Anaya Singh", email: "anaya@wildcard.edu", passwordHash, role: Role.STUDENT, wildCardId: "WC-STU-1002" } }),
    prisma.user.create({ data: { name: "Vivaan Mehta", email: "vivaan@wildcard.edu", passwordHash, role: Role.STUDENT, wildCardId: "WC-STU-1003" } }),
  ]);

  await prisma.studentAccount.createMany({
    data: [
      { userId: students[0].id, walletBalance: 2400, monthlyLimit: 3000, dailyLimit: 250, spentThisMonth: 980, spentToday: 65, dailySpendUpdatedAt: new Date() },
      { userId: students[1].id, walletBalance: 1200, monthlyLimit: 2500, dailyLimit: 200, spentThisMonth: 1430, spentToday: 120, dailySpendUpdatedAt: new Date() },
      { userId: students[2].id, walletBalance: 1800, monthlyLimit: 2800, dailyLimit: 220, spentThisMonth: 790, spentToday: 0, dailySpendUpdatedAt: new Date() },
    ],
  });

  await prisma.parentStudentLink.create({ data: { parentId: parent.id, studentId: students[0].id } });

  const mealRecords = await Promise.all(
    meals.map(([name, slug, description, category, price, healthTag, iconKey]) =>
      prisma.mealItem.create({
        data: { name, slug, description, category, price, quantityAvailable: 120, healthTag, iconKey, isActive: true },
      }),
    ),
  );

  const tx1 = await prisma.transaction.create({
    data: { studentId: students[0].id, totalAmount: 95, paymentMethod: PaymentMethod.WALLET, createdAt: new Date(Date.now() - 2 * 86400000) },
  });

  await prisma.transactionItem.createMany({
    data: [
      { transactionId: tx1.id, mealItemId: mealRecords.find((m) => m.slug === "veg-sandwich")!.id, quantity: 1, unitPrice: 45, subtotal: 45 },
      { transactionId: tx1.id, mealItemId: mealRecords.find((m) => m.slug === "lemonade")!.id, quantity: 1, unitPrice: 30, subtotal: 30 },
      { transactionId: tx1.id, mealItemId: mealRecords.find((m) => m.slug === "biscuits")!.id, quantity: 1, unitPrice: 15, subtotal: 15 },
    ],
  });

  const tx2 = await prisma.transaction.create({
    data: { studentId: students[0].id, totalAmount: 110, paymentMethod: PaymentMethod.WALLET, createdAt: new Date(Date.now() - 7 * 86400000) },
  });

  await prisma.transactionItem.createMany({
    data: [
      { transactionId: tx2.id, mealItemId: mealRecords.find((m) => m.slug === "rajma-chawal")!.id, quantity: 1, unitPrice: 70, subtotal: 70 },
      { transactionId: tx2.id, mealItemId: mealRecords.find((m) => m.slug === "water-bottle")!.id, quantity: 2, unitPrice: 20, subtotal: 40 },
    ],
  });

  console.log({ cashier: cashier.email, parent: parent.email, seededStudents: students.length, meals: mealRecords.length });
}

main().finally(() => prisma.$disconnect());
