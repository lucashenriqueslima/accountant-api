import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDeleteUser, useUsers } from '@/features/users/api';
import { roleLabels, roleStyles } from '@/features/users/constants';

export function UsersListPage() {
  const { data: users, isLoading } = useUsers();
  const deleteUser = useDeleteUser();

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Excluir o usuário "${name}"? Ele perderá o acesso ao sistema.`)) {
      deleteUser.mutate(id);
    }
  };

  return (
    <>
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold">Usuários</h1>
          <p className="text-sm text-muted-foreground">Gerencie membros e papéis do escritório.</p>
        </div>
        <Button asChild>
          <Link to="/usuarios/novo">
            <Plus className="size-4" />
            Novo usuário
          </Link>
        </Button>
      </header>

      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : (
          <div className="rounded-xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2.5 text-left font-medium">Nome</th>
                  <th className="px-4 py-2.5 text-left font-medium">E-mail</th>
                  <th className="px-4 py-2.5 text-left font-medium">Papel</th>
                  <th className="px-4 py-2.5 text-left font-medium">Status</th>
                  <th className="px-4 py-2.5 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      Nenhum usuário cadastrado.
                    </td>
                  </tr>
                ) : (
                  users?.map((user) => (
                    <tr key={user.id} className="border-b last:border-0 hover:bg-muted/40">
                      <td className="px-4 py-3 font-medium">{user.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                      <td className="px-4 py-3">
                        <Badge className={cn('border-transparent', roleStyles[user.role])}>
                          {roleLabels[user.role]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={user.active ? 'default' : 'outline'}>
                          {user.active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button asChild variant="ghost" size="icon" title="Ver">
                            <Link to={`/usuarios/${user.id}`}>
                              <Eye className="size-4" />
                            </Link>
                          </Button>
                          <Button asChild variant="ghost" size="icon" title="Editar">
                            <Link to={`/usuarios/${user.id}/editar`}>
                              <Pencil className="size-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Excluir"
                            onClick={() => handleDelete(user.id, user.name)}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
