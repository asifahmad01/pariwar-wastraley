import { PrismaClient } from "@prisma/client";
import { PRODUCTS } from "../data/products";

const prisma = new PrismaClient();

async function main() {
  await prisma.product.deleteMany();
  for (const p of PRODUCTS) {
    await prisma.product.create({
      data: {
        id: p.id,
        name: p.name,
        nameHi: p.nameHi ?? null,
        category: p.category,
        style: p.style,
        description: p.description ?? null,
        price: p.showPrice ? p.price : null,
        showPrice: p.showPrice,
        badge: p.badge ?? null,
        colors: JSON.stringify(p.colors),
        colorHex: JSON.stringify(p.colorHex),
        sizes: JSON.stringify(p.sizes),
        image: p.image ?? null,
        fabric: p.fabric ?? null,
      },
    });
  }
  console.log(`Seeded ${PRODUCTS.length} products.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
