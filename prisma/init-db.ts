import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("=== INICIANDO INIT-DB (CREACIÓN DE TABLAS Y ADMIN) ===");

  const adminEmail = "davidjuanmontano7@gmail.com";
  const rawPassword = "Admin123";

  // 1. Asegurar configuración base sin borrar datos existentes
  const config = await prisma.configuracion.findFirst();
  if (!config) {
    await prisma.configuracion.create({
      data: {
        id: 1,
        moneda: "COP",
        formatoFecha: "DD/MM/YYYY",
        estrategiaPago: "BOLA_DE_NIEVE",
        modalidadSalario: "QUINCENAL",
        preferenciasDashboard: JSON.stringify({
          tema: "dark",
          animaciones: true,
          graficoFavorito: "donut",
        }),
      },
    });
    console.log("✓ Configuración base inicializada.");
  }

  // 2. Crear o actualizar usuario administrador
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  const existingUser = await prisma.usuario.findUnique({
    where: { email: adminEmail },
  });

  if (!existingUser) {
    // También verificar si existía el usuario anterior david@milibertadfinanciera.com y actualizarlo
    const oldUser = await prisma.usuario.findFirst({
      where: {
        OR: [
          { email: "david@milibertadfinanciera.com" },
          { nombre: "David" },
        ],
      },
    });

    if (oldUser) {
      await prisma.usuario.update({
        where: { id: oldUser.id },
        data: {
          email: adminEmail,
          nombre: "David Juan Montaño",
          password: hashedPassword,
        },
      });
      console.log(`✓ Usuario anterior actualizado a: ${adminEmail}`);
    } else {
      await prisma.usuario.create({
        data: {
          email: adminEmail,
          nombre: "David Juan Montaño",
          password: hashedPassword,
        },
      });
      console.log(`✓ Nuevo usuario administrador creado: ${adminEmail}`);
    }
  } else {
    // Si ya existe, asegurar que tenga la contraseña correcta Admin123
    await prisma.usuario.update({
      where: { email: adminEmail },
      data: {
        nombre: "David Juan Montaño",
        password: hashedPassword,
      },
    });
    console.log(`✓ Contraseña de usuario administrador actualizada para: ${adminEmail}`);
  }

  console.log("=== BASE DE DATOS Y USUARIO LISTOS PARA USAR ===");
}

main()
  .catch((e) => {
    console.error("Error en init-db:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
