import { prisma } from "./db.js";

async function main() {
  const relDeleted = await prisma.relation.deleteMany();
  const entDeleted = await prisma.entity.deleteMany();
  console.log(`Deleted ${relDeleted.count} relations and ${entDeleted.count} entities.`);
  await prisma.$disconnect();
}

main();