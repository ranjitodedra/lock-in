import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatDateTime,
  formatList,
  formatText,
} from "@/lib/applications/format";
import type { AdminUserRow } from "@/lib/admin/queries";

type UsersTableProps = {
  users: AdminUserRow[];
};

function truncateId(id: string): string {
  if (id.length <= 12) return id;
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
}

export function UsersTable({ users }: UsersTableProps) {
  if (users.length === 0) {
    return (
      <p className="px-6 py-12 text-center text-sm text-muted-foreground">
        No users found.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>User ID</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Verified</TableHead>
          <TableHead>Last sign-in</TableHead>
          <TableHead>Provider(s)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{formatText(user.email)}</TableCell>
            <TableCell>
              <code
                className="font-mono text-xs"
                title={user.id}
              >
                {truncateId(user.id)}
              </code>
            </TableCell>
            <TableCell>{formatDateTime(user.created_at)}</TableCell>
            <TableCell>
              {user.email_confirmed_at ? "Yes" : "No"}
            </TableCell>
            <TableCell>{formatDateTime(user.last_sign_in_at)}</TableCell>
            <TableCell>{formatList(user.providers)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
