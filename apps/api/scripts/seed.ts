import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const company = await prisma.company.create({
    data: { name: "Test Company", industry: "Manufacturing" }
  });
  
  await prisma.user.create({
    data: {
      companyId: company.id,
      email: "admin@vendorflow.com",
      passwordHash: "password",
      role: "ADMIN",
      name: "Admin User"
    }
  });

  await prisma.user.create({
    data: {
      companyId: company.id,
      email: "procurement@vendorflow.com",
      passwordHash: "password",
      role: "PROCUREMENT_MANAGER",
      name: "Procurement User"
    }
  });

  console.log("Database seeded successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
