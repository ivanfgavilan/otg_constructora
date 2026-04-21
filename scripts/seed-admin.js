/**
 * Script para crear el usuario administrador en producción.
 * 
 * Ejecutar desde la consola de EasyPanel (Terminal del contenedor):
 *   node scripts/seed-admin.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@otgconstructora.com';
  const password = 'OtgC0nstructor4#';
  const name = 'Administrador OTG';

  // Verificar si ya existe
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`⚠️  El usuario ${email} ya existe. No se creó uno nuevo.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: 'admin',
    },
  });

  console.log(`✅ Usuario admin creado exitosamente:`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Nombre: ${user.name}`);
  console.log(`   Rol: ${user.role}`);
}

main()
  .catch((e) => {
    console.error('❌ Error al crear el admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
