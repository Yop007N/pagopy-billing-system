import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Hash password for test user
  const hashedPassword = await bcrypt.hash('Admin123!', 10);

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@facturacion.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'ADMIN',
      emailVerified: true,
      active: true,
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create sample products
  const products = await prisma.product.createMany({
    data: [
      {
        name: 'Laptop HP ProBook 450',
        description: 'Laptop empresarial con procesador Intel Core i5',
        sku: 'LAP-HP-001',
        price: 799.99,
        stock: 15,
        category: 'ELECTRONICS',
        active: true,
      },
      {
        name: 'Mouse Logitech MX Master 3',
        description: 'Mouse inalambrico ergonomico de alta precision',
        sku: 'ACC-LOG-002',
        price: 99.99,
        stock: 50,
        category: 'ELECTRONICS',
        active: true,
      },
      {
        name: 'Teclado Mecanico Keychron K2',
        description: 'Teclado mecanico inalambrico 75%',
        sku: 'ACC-KEY-003',
        price: 89.99,
        stock: 30,
        category: 'ELECTRONICS',
        active: true,
      },
      {
        name: 'Monitor Dell 27" 4K',
        description: 'Monitor profesional 4K UHD con panel IPS',
        sku: 'MON-DEL-004',
        price: 449.99,
        stock: 20,
        category: 'ELECTRONICS',
        active: true,
      },
      {
        name: 'Silla Ergonomica Herman Miller',
        description: 'Silla de oficina con soporte lumbar ajustable',
        sku: 'FUR-HM-005',
        price: 1299.99,
        stock: 10,
        category: 'FURNITURE',
        active: true,
      },
    ],
  });

  console.log(`✅ ${products.count} products created`);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
