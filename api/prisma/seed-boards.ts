/**
 * Seed de ESTRUTURA: cria os quadros e as colunas padrão do escritório.
 *
 * Diferente de `seed.ts` (que apaga todas as tabelas e repõe dados de exemplo,
 * e por isso é bloqueado fora do ambiente local), este script é **aditivo e
 * idempotente**: nunca apaga nem altera nada, só cria o que estiver faltando.
 * Por isso pode rodar em produção.
 *
 *   pnpm db:seed:boards              # cria o que faltar
 *   DRY_RUN=true pnpm db:seed:boards # só mostra o que faria
 *
 * Os nomes das colunas importam para duas regras do sistema: o cron gera os
 * cartões dos modelos na coluna "A fazer", e o envio de e-mail da tarefa só
 * libera na coluna "Concluído".
 */
import { Department, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const dryRun = process.env.DRY_RUN === 'true';

interface QuadroPadrao {
  name: string;
  description: string;
  department: Department;
  position: number;
  columns: { name: string; position: number; color: string }[];
}

// Mesma estrutura do ambiente local (ver `seed.ts`).
const QUADROS: QuadroPadrao[] = [
  {
    name: 'Departamento Fiscal',
    description: 'Obrigações fiscais mensais e acessórias',
    department: Department.FISCAL,
    position: 0,
    columns: [
      { name: 'A fazer', position: 0, color: '#94a3b8' },
      { name: 'Em andamento', position: 1, color: '#3b82f6' },
      { name: 'Em revisão', position: 2, color: '#f59e0b' },
      { name: 'Concluído', position: 3, color: '#22c55e' },
    ],
  },
  {
    name: 'Departamento Pessoal',
    description: 'Folha de pagamento, admissões e rescisões',
    department: Department.PESSOAL,
    position: 1,
    columns: [
      { name: 'A fazer', position: 0, color: '#94a3b8' },
      { name: 'Em andamento', position: 1, color: '#3b82f6' },
      { name: 'Concluído', position: 2, color: '#22c55e' },
    ],
  },
];

async function main() {
  const host = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).hostname : '(?)';
  console.log(`🌱 Seed de quadros e colunas — banco em "${host}"${dryRun ? ' · DRY RUN' : ''}`);

  let quadrosCriados = 0;
  let colunasCriadas = 0;

  for (const quadro of QUADROS) {
    const existente = await prisma.board.findFirst({
      where: { name: quadro.name },
      include: { columns: true },
    });

    if (!existente) {
      console.log(`  + quadro "${quadro.name}" com ${quadro.columns.length} coluna(s)`);
      quadrosCriados += 1;
      colunasCriadas += quadro.columns.length;
      if (!dryRun) {
        await prisma.board.create({
          data: {
            name: quadro.name,
            description: quadro.description,
            department: quadro.department,
            position: quadro.position,
            columns: { create: quadro.columns },
          },
        });
      }
      continue;
    }

    console.log(`  = quadro "${quadro.name}" já existe — mantido como está`);

    // Completa apenas as colunas que faltam; as existentes não são tocadas
    // (nome, ordem e cor podem ter sido ajustados de propósito).
    for (const coluna of quadro.columns) {
      if (existente.columns.some((c) => c.name.trim().toLowerCase() === coluna.name.toLowerCase())) {
        continue;
      }
      console.log(`    + coluna "${coluna.name}"`);
      colunasCriadas += 1;
      if (!dryRun) {
        await prisma.column.create({ data: { ...coluna, boardId: existente.id } });
      }
    }
  }

  const verbo = dryRun ? 'seriam criados' : 'criados';
  console.log(`✅ ${quadrosCriados} quadro(s) e ${colunasCriadas} coluna(s) ${verbo}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
