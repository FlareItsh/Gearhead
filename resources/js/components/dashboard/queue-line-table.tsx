import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function QueueLineTable() {
  return (
    <div className="custom-scrollbar overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Services</TableHead>
            <TableHead>Queue</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody></TableBody>
      </Table>
    </div>
  )
}
