// Uma tarefa está "concluída" quando está na coluna "Concluído" do quadro.
// (Espelha isDoneColumnName do backend — usado para liberar o envio de e-mail.)
export function isDoneColumnName(name?: string | null): boolean {
  if (!name) return false;
  return (
    name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase() === 'concluido'
  );
}
