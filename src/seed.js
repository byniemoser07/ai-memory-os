import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const alpha = await prisma.entity.create({
    data: { name: "Project Alpha", type: "Project" },
  });

  const python = await prisma.entity.create({
    data: { name: "Python", type: "Technology" },
  });

  await prisma.relation.create({
    data: {
      sourceId: alpha.id,
      targetId: python.id,
      relationType: "uses",
    },
  });

  const check = await prisma.entity.findMany({
    include: { outgoing: true },
  });

  console.log(JSON.stringify(check, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());