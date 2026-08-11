import { PrismaClient, CardFrequency, Department, Priority, Role, TaxRegime } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Senha de desenvolvimento para todos os usuários do seed.
const DEV_PASSWORD = 'Forte@123';

// Hosts considerados seguros para rodar o seed.
const HOSTS_LOCAIS = ['localhost', '127.0.0.1', '::1', 'host.docker.internal', 'mysql', 'db'];

/**
 * Trava de segurança: o seed apaga TODAS as tabelas antes de repovoar, e cria
 * usuários com uma senha pública versionada neste arquivo. Rodar isso contra
 * produção destrói a base inteira. Só liberamos quando o banco é claramente
 * local — ou quando alguém passa SEED_ALLOW_REMOTE=true de propósito.
 */
function garantirBancoSeguro() {
  if (process.env.SEED_ALLOW_REMOTE === 'true') {
    console.warn('⚠️  SEED_ALLOW_REMOTE=true — trava desativada explicitamente.');
    return;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'Seed bloqueado: NODE_ENV=production. Ele apaga todas as tabelas e repõe dados de exemplo.',
    );
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('Seed bloqueado: DATABASE_URL não está definida.');
  }

  // Falha fechada: se não der para identificar o host com certeza, não roda.
  let host: string;
  try {
    host = new URL(url).hostname;
  } catch {
    throw new Error(
      'Seed bloqueado: não foi possível extrair o host da DATABASE_URL para validá-la.',
    );
  }

  if (!HOSTS_LOCAIS.includes(host)) {
    throw new Error(
      `Seed bloqueado: DATABASE_URL aponta para "${host}", que não é um banco local.\n` +
        'Se isso é intencional, rode com SEED_ALLOW_REMOTE=true.',
    );
  }
}

async function main() {
  garantirBancoSeguro();

  console.log('🌱 Populando o banco de dados...');

  // Limpa em ordem segura (respeitando FKs)
  await prisma.passwordResetToken.deleteMany();
  await prisma.cardLabel.deleteMany();
  await prisma.card.deleteMany();
  await prisma.cardType.deleteMany();
  await prisma.cardTemplate.deleteMany();
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

  // Tipos de tarefa (títulos pré-salvos) para agilizar a criação de cartões.
  await prisma.cardType.createMany({
    data: [
      { title: 'Apuração de ICMS' },
      { title: 'Entrega do Simples Nacional (PGDAS-D)' },
      { title: 'Declaração Anual do MEI (DASN-SIMEI)' },
      { title: 'Folha de pagamento' },
      { title: 'Fechamento contábil mensal' },
    ],
  });

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

  // Modelos de Tarefa — tarefas recorrentes que o cron transforma em cartões
  // todo dia às 00:01, na coluna "A fazer" do quadro (sem responsável).
  await prisma.cardTemplate.createMany({
    data: [
      {
        title: 'Apuração de ICMS',
        description: 'Apurar e transmitir a GIA do mês.',
        priority: Priority.HIGH,
        frequency: CardFrequency.MONTHLY,
        boardId: fiscal.id,
        clientId: techStore.id,
      },
      {
        title: 'Entrega do Simples Nacional (PGDAS-D)',
        description: 'Calcular e transmitir o DAS do Simples.',
        priority: Priority.MEDIUM,
        frequency: CardFrequency.MONTHLY,
        boardId: fiscal.id,
        clientId: padaria.id,
      },
      {
        title: 'Declaração Anual do MEI (DASN-SIMEI)',
        description: 'Declaração anual referente ao exercício anterior.',
        priority: Priority.LOW,
        frequency: CardFrequency.YEARLY,
        boardId: fiscal.id,
        clientId: mei.id,
      },
      {
        title: 'Fechamento contábil mensal',
        priority: Priority.MEDIUM,
        frequency: CardFrequency.MONTHLY,
        boardId: fiscal.id,
      },
    ],
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
