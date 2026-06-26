import { PrismaClient, Department, Priority, Role, TaxRegime } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Senha de desenvolvimento para todos os usuários do seed.
const DEV_PASSWORD = 'Forte@123';

async function main() {
  console.log('🌱 Populando o banco de dados...');

  // Limpa em ordem segura (respeitando FKs)
  await prisma.passwordResetToken.deleteMany();
  await prisma.cardLabel.deleteMany();
  await prisma.card.deleteMany();
  await prisma.column.deleteMany();
  await prisma.board.deleteMany();
  await prisma.label.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 10);

  // Usuários do escritório (todos com a senha de desenvolvimento)
  const [admin, ana, bruno] = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Administrador',
        email: 'admin@fortecontabilidade.com.br',
        role: Role.ADMIN,
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Ana Souza',
        email: 'ana@fortecontabilidade.com.br',
        role: Role.MANAGER,
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Bruno Lima',
        email: 'bruno@fortecontabilidade.com.br',
        role: Role.EMPLOYEE,
        passwordHash,
      },
    }),
  ]);

  // Clientes
  const [padaria, techStore, mei] = await Promise.all([
    prisma.client.create({
      data: {
        name: 'Padaria Pão Quente Ltda',
        tradeName: 'Pão Quente',
        document: '12.345.678/0001-90',
        taxRegime: TaxRegime.SIMPLES_NACIONAL,
        email: 'contato@paoquente.com.br',
        phone: '(11) 4002-8922',
      },
    }),
    prisma.client.create({
      data: {
        name: 'Tech Store Comércio de Eletrônicos S.A.',
        tradeName: 'Tech Store',
        document: '98.765.432/0001-21',
        taxRegime: TaxRegime.LUCRO_PRESUMIDO,
        email: 'financeiro@techstore.com.br',
      },
    }),
    prisma.client.create({
      data: {
        name: 'João da Silva',
        document: '123.456.789-00',
        taxRegime: TaxRegime.MEI,
        email: 'joao.mei@gmail.com',
      },
    }),
  ]);

  // Etiquetas
  const [urgente, mensal, anual] = await Promise.all([
    prisma.label.create({ data: { name: 'Urgente', color: '#ef4444' } }),
    prisma.label.create({ data: { name: 'Mensal', color: '#3b82f6' } }),
    prisma.label.create({ data: { name: 'Anual', color: '#8b5cf6' } }),
  ]);

  // Quadro do Departamento Fiscal com colunas
  const fiscal = await prisma.board.create({
    data: {
      name: 'Departamento Fiscal',
      description: 'Obrigações fiscais mensais e acessórias',
      department: Department.FISCAL,
      position: 0,
      columns: {
        create: [
          { name: 'A fazer', position: 0, color: '#94a3b8' },
          { name: 'Em andamento', position: 1, color: '#3b82f6' },
          { name: 'Em revisão', position: 2, color: '#f59e0b' },
          { name: 'Concluído', position: 3, color: '#22c55e' },
        ],
      },
    },
    include: { columns: { orderBy: { position: 'asc' } } },
  });

  const [todo, doing] = fiscal.columns;

  await prisma.card.create({
    data: {
      title: 'Apuração de ICMS — Maio/2026',
      description: 'Apurar e transmitir a GIA do mês.',
      priority: Priority.HIGH,
      dueDate: new Date('2026-06-10'),
      position: 0,
      columnId: todo.id,
      clientId: techStore.id,
      assigneeId: bruno.id,
      createdById: ana.id,
      labels: { create: [{ labelId: urgente.id }, { labelId: mensal.id }] },
    },
  });

  await prisma.card.create({
    data: {
      title: 'Entrega do Simples Nacional (PGDAS-D)',
      description: 'Calcular e transmitir o DAS do Simples.',
      priority: Priority.MEDIUM,
      dueDate: new Date('2026-06-20'),
      position: 0,
      columnId: doing.id,
      clientId: padaria.id,
      assigneeId: bruno.id,
      createdById: ana.id,
      labels: { create: [{ labelId: mensal.id }] },
    },
  });

  await prisma.card.create({
    data: {
      title: 'Declaração Anual do MEI (DASN-SIMEI)',
      description: 'Declaração anual referente ao exercício anterior.',
      priority: Priority.LOW,
      dueDate: new Date('2026-05-31'),
      position: 1,
      columnId: todo.id,
      clientId: mei.id,
      assigneeId: ana.id,
      createdById: admin.id,
      labels: { create: [{ labelId: anual.id }] },
    },
  });

  // Quadro do Departamento Pessoal (sem cartões, só estrutura)
  await prisma.board.create({
    data: {
      name: 'Departamento Pessoal',
      description: 'Folha de pagamento, admissões e rescisões',
      department: Department.PESSOAL,
      position: 1,
      columns: {
        create: [
          { name: 'A fazer', position: 0, color: '#94a3b8' },
          { name: 'Em andamento', position: 1, color: '#3b82f6' },
          { name: 'Concluído', position: 2, color: '#22c55e' },
        ],
      },
    },
  });

  console.log('✅ Seed concluído.');
  console.log(`   Login: admin@fortecontabilidade.com.br · senha: ${DEV_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
