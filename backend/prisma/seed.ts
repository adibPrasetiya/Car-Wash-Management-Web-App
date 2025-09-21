import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Hash passwords
  const ownerPassword = await bcrypt.hash('owner123', 10);
  const cashierPassword = await bcrypt.hash('cashier123', 10);

  // Create users
  const owner = await prisma.user.upsert({
    where: { username: 'owner' },
    update: {},
    create: {
      name: 'Admin Owner',
      username: 'owner',
      password: ownerPassword,
      role: 'owner',
    },
  });

  const cashier = await prisma.user.upsert({
    where: { username: 'cashier' },
    update: {},
    create: {
      name: 'Kasir 1',
      username: 'cashier',
      password: cashierPassword,
      role: 'cashier',
    },
  });

  // Create sample service packages
  const basicWash = await prisma.servicePackage.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Cuci Mobil Basic',
      description: 'Cuci luar dan dalam',
      price: 25000,
    },
  });

  const premiumWash = await prisma.servicePackage.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Cuci Mobil Premium',
      description: 'Cuci luar, dalam, dan wax',
      price: 50000,
    },
  });

  // Create sample service types
  const exteriorWash = await prisma.serviceType.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Cuci Luar',
      description: 'Mencuci bagian luar kendaraan',
      price: 15000,
    },
  });

  const interiorWash = await prisma.serviceType.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Cuci Dalam',
      description: 'Membersihkan interior kendaraan',
      price: 20000,
    },
  });

  // Create sample client
  const client = await prisma.client.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'John Doe',
      phone: '081234567890',
      email: 'john@example.com',
    },
  });

  // Create sample vehicle
  const vehicle = await prisma.vehicle.upsert({
    where: { id: 1 },
    update: {},
    create: {
      clientId: client.id,
      plate: 'B 1234 ABC',
      type: 'car',
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('👤 Users created:');
  console.log(`   - Owner: username "owner", password "owner123"`);
  console.log(`   - Cashier: username "cashier", password "cashier123"`);
  console.log('🚗 Sample data created for clients, vehicles, and services');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });