import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

const users = [
  { email: 'admin@enosa.test', firstName: 'Administrador', lastName: 'ENOSA', role: UserRole.ADMIN, password: 'Admin123456' },
  { email: 'ana.operaciones@enosa.test', firstName: 'Ana', lastName: 'Operaciones', role: UserRole.SUPERVISOR, password: 'Test123456' },
  { email: 'luis.reportes@enosa.test', firstName: 'Luis', lastName: 'Reportes', role: UserRole.VIEWER, password: 'Test123456' },
  { email: 'carlos.piura@enosa.test', firstName: 'Carlos', lastName: 'Piura', role: UserRole.TECHNICIAN, password: 'Test123456' },
  { email: 'maria.sullana@enosa.test', firstName: 'María', lastName: 'Sullana', role: UserRole.TECHNICIAN, password: 'Test123456' },
  { email: 'jorge.talara@enosa.test', firstName: 'Jorge', lastName: 'Talara', role: UserRole.TECHNICIAN, password: 'Test123456' },
  { email: 'diana.tumbes@enosa.test', firstName: 'Diana', lastName: 'Tumbes', role: UserRole.TECHNICIAN, password: 'Test123456' },
  { email: 'siscon-integration@sigom.internal', firstName: 'SISCON', lastName: 'Integration', role: UserRole.SUPERVISOR, password: randomBytes(32).toString('hex') },
];

async function main() {
  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    await prisma.user.upsert({
      where: { email: user.email },
      update: { firstName: user.firstName, lastName: user.lastName, role: user.role, isActive: true, passwordHash },
      create: { email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, isActive: true, passwordHash },
    });
  }
  console.log(`Seeded ${users.length} SIGOM work users.`);
}

main().finally(() => prisma.$disconnect());
