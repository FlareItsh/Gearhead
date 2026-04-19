import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import axios from 'axios'
import { Calendar, History, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

interface LedgerEntry {
  date: string
  type: 'Purchase' | 'Pullout'
  supplier_name: string | null
  employee_name: string | null
  qty_in: number
  qty_out: number
  reference_no: string | number
}

interface SupplyLedgerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplyId: number | null
  supplyName: string | null
}

export default function SupplyLedgerModal({
  open,
  onOpenChange,
  supplyId,
  supplyName,
}: SupplyLedgerModalProps) {
  const [ledger, setLedger] = useState<LedgerEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Set default date range (First of month to Today)
  useEffect(() => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const formatLocal = (date: Date) => {
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    }
    setStartDate(formatLocal(firstDay))
    setEndDate(formatLocal(now))
  }, [])

  useEffect(() => {
    if (open && supplyId) {
      loadLedger()
    }
  }, [open, supplyId, startDate, endDate])

  const loadLedger = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`/api/supplies/${supplyId}/ledger`, {
        params: {
          start_date: startDate || null,
          end_date: endDate || null,
        },
      })
      setLedger(res.data)
    } catch (err) {
      console.error('Failed to load ledger:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '—'
    // Ensure the date string is treated as UTC if it doesn't have a timezone suffix
    const utcDateString = dateString.includes('Z') || dateString.includes('+')
      ? dateString
      : dateString.replace(' ', 'T') + 'Z'

    return new Intl.DateTimeFormat('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(utcDateString))
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="flex max-h-[95vh] flex-col overflow-hidden bg-background p-0 sm:max-w-6xl border border-border shadow-2xl">
        {/* Header Section with Integrated Filters */}
        <div className="border-b bg-muted p-6 pb-4">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
                <History className="h-7 w-7 text-yellow-500" />
                Supply <span className="text-yellow-500">Ledger</span>
              </DialogTitle>
              <DialogDescription className="text-sm font-medium">
                Inventory history for <span className="text-foreground font-bold">{supplyName}</span>
              </DialogDescription>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-background p-3 shadow-sm">
              <div className="space-y-1.5">
                <Label
                  htmlFor="startDate"
                  className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"
                >
                  <Calendar className="h-3 w-3" /> From Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-9 w-[160px] border-border/60 bg-muted/20 text-xs focus:ring-yellow-500"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="endDate"
                  className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"
                >
                  <Calendar className="h-3 w-3" /> To Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-9 w-[160px] border-border/60 bg-muted/20 text-xs focus:ring-yellow-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
          <div className="rounded-xl border border-border bg-card shadow-sm">
            {loading ? (
              <div className="flex h-[400px] flex-col items-center justify-center gap-3">
                <div className="relative h-12 w-12 text-yellow-500">
                  <Loader2 className="h-12 w-12 animate-spin" />
                  <History className="absolute inset-0 m-auto h-5 w-5 opacity-50" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Refreshing records...</p>
              </div>
            ) : ledger.length > 0 ? (
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0 z-10 backdrop-blur-sm">
                  <TableRow className="border-b border-border/50">
                    <TableHead className="w-[200px] font-bold text-foreground">Date & Time</TableHead>
                    <TableHead className="w-[120px] font-bold text-foreground text-center">Type</TableHead>
                    <TableHead className="font-bold text-foreground">Supplier</TableHead>
                    <TableHead className="font-bold text-foreground">Employee</TableHead>
                    <TableHead className="text-center font-bold text-foreground">Qty In</TableHead>
                    <TableHead className="text-center font-bold text-foreground">Qty Out</TableHead>
                    <TableHead className="text-right font-bold text-foreground">Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledger.map((entry, index) => (
                    <TableRow
                      key={index}
                      className="group border-b border-border/30 transition-colors hover:bg-muted/30"
                    >
                      <TableCell className="py-4 font-medium">
                        {formatDate(entry.date)}
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <Badge
                          className={`rounded-full border-none px-3 py-1 font-semibold ${
                            entry.type === 'Purchase'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : entry.type === 'Return'
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                              : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                          }`}
                        >
                          {entry.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 text-muted-foreground">
                        {entry.supplier_name || ''}
                      </TableCell>
                      <TableCell className="py-4 text-muted-foreground">
                        {entry.employee_name || ''}
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        {entry.qty_in > 0 ? (
                          <div className="inline-flex items-center gap-1 rounded-md bg-emerald-500/5 px-2 py-1 text-emerald-600 dark:text-emerald-400">
                            <span className="text-xs font-bold">+</span>
                            <span className="text-sm font-black">{entry.qty_in}</span>
                          </div>
                        ) : ''}
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        {entry.qty_out > 0 ? (
                          <div className="inline-flex items-center gap-1 rounded-md bg-rose-500/5 px-2 py-1 text-rose-600 dark:text-rose-400">
                            <span className="text-xs font-bold">-</span>
                            <span className="text-sm font-black">{entry.qty_out}</span>
                          </div>
                        ) : ''}
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        {entry.type === 'Purchase' && entry.reference_no && (
                          <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-bold text-muted-foreground">
                            {entry.reference_no}
                          </code>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex h-[400px] flex-col items-center justify-center space-y-3 p-12 text-center">
                <div className="rounded-full bg-muted p-6">
                  <History className="h-16 w-16 text-muted-foreground/30" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">No Records Found</h3>
                  <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                    No transactions match your current filters. Try adjusting your date range or selecting another item.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t bg-muted/10 px-6 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Gearhead Inventory Management System
          </p>
          <Badge
            variant="outline"
            className="border-border/60 text-[10px] font-normal"
          >
            {ledger.length} Record{ledger.length !== 1 ? 's' : ''} Listed
          </Badge>
        </div>
      </DialogContent>
    </Dialog>
  )
}
