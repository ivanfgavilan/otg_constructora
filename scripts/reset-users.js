/**
 * Script para re-hashear o crear usuarios de forma segura.
 * 
 * PROBLEMA RESUELTO: Inyectar hashes bcrypt via terminal falla porque el shell
 * interpreta caracteres especiales como $ en los hashes. Este script evita
 * ese problema usando Node directamente — sin pasar el hash por el shell.
 * 
 * USO desde la consola de EasyPanel:
 *   node scripts/reset-users.js
 * 
 * El script crea o actualiza los usuarios definidos en el array USERS.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// =============================================
// USUARIOS A CREAR O ACTUALIZAR
// Editá este array según necesites
// =============================================
const USERS = [
  {
    email: 'admin@otgconstructora.com',
    password: 'OtgC0nstructor4#',
    name: 'Administrador OTG',
    role: 'admin',
  },
];
// =============================================

async function main() {
  console.log('🔐 Iniciando reset/creación de usuarios...\n');

  for (const userData of USERS) {
    console.log(`⏳ Procesando: ${userData.email}`);

    // Hashear la contraseña directamente en Node (sin shell, sin problemas de $)
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    console.log(`   Hash generado correctamente (longitud: ${hashedPassword.length})`);

    // Upsert: crea si no existe, actualiza si ya existe
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        password: hashedPassword,
        name: userData.name,
        role: userData.role,
      },
      create: {
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        role: userData.role,
      },
    });

    console.log(`   ✅ Usuario listo: ${user.email} | Rol: ${user.role} | ID: ${user.id}\n`);
  }

  console.log('✔️  Todos los usuarios fueron procesados correctamente.');
  console.log('💡 Ahora podés loguearte con las credenciales definidas en el script.');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
