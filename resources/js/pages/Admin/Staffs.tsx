import Heading from '@/components/heading'
import HeadingSmall from '@/components/heading-small'
import Pagination from '@/components/Pagination'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { usePermissions } from '@/hooks/use-permissions'
import AppLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'
import axios from 'axios'
import { ChevronDownIcon, HandCoins, Pencil, Plus, Search, Trash2, Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

// ---------- Interfaces ----------
interface BreadcrumbItem {
  title: string
  href: string
}

interface Staff {
  id: number
  firstName: string
  lastName: string
  middleName?: string
  phone: string
  address: string
  status: 'Active' | 'Inactive' | 'Absent'
  assignedStatus: 'available' | 'assigned' | 'on_leave'
  dateHired: string
  role: 'Admin' | 'Employee'
  commissionPercentage: number
}

interface PaginatedLink {
  url: string | null
  label: string
  active: boolean
}

interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  links: PaginatedLink[]
}

// ---------- Breadcrumbs ----------
const breadcrumbs: BreadcrumbItem[] = [{ title: 'Staff Management', href: '/staffs' }]

export default function Staffs() {
  const [staffData, setStaffData] = useState<PaginatedResponse<Staff> | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'All' | 'Active' | 'Inactive' | 'Absent'>('All')
  const [perPage, setPerPage] = useState(10)
  const [loading, setLoading] = useState(true)
  const { hasPermission } = usePermissions()

  // Add / Edit Form state
  const [addForm, setAddForm] = useState({
    phone: '',
    address: '',
    commissionPercentage: '',
  })
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    phone: '',
    address: '',
    status: 'Active' as Staff['status'],
    commissionPercentage: '',
  })

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingStaffId, setDeletingStaffId] = useState<number | null>(null)

  // Commission modal state
  const [showCommissionModal, setShowCommissionModal] = useState(false)
  const [selectedStaffIdForCommission, setSelectedStaffIdForCommission] = useState<number | null>(
    null,
  )
  const [commissionStartDate, setCommissionStartDate] = useState<string>('')
  const [commissionEndDate, setCommissionEndDate] = useState<string>('')
  const [commissionData, setCommissionData] = useState<{
    employee: string
    commission_percentage: number
    orders: any[]
    total_commission: number
  } | null>(null)
  const [loadingCommissions, setLoadingCommissions] = useState(false)

  // Wallet modal state
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [selectedStaffIdForWallet, setSelectedStaffIdForWallet] = useState<number | null>(null)
  const [walletData, setWalletData] = useState<{
    employee: string
    total_earned: number
    total_paid: number
    balance: number
    payouts: any[]
  } | null>(null)
  const [loadingWallet, setLoadingWallet] = useState(false)
  const [payoutForm, setPayoutForm] = useState({
    amount: '',
    payout_date: new Date().toISOString().split('T')[0],
    remarks: '',
  })
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false)

  // Helper to get current month range
  const getCurrentMonthRange = () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const format = (date: Date) =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

    return { start: format(firstDay), end: format(lastDay) }
  }

  // Load Staffs
  const loadStaffs = async (url?: string) => {
    try {
      setLoading(true)
      const endpoint = url || '/api/employees/list'
      const params: any = {
        per_page: perPage,
        search: search,
        status: filter === 'All' ? null : filter,
      }

      let finalUrl = endpoint
      const finalParams = { ...params }
      if (url) {
        finalUrl = url
        // Ensure parameters are maintained if url doesn't have them,
        // but typically pagination links have page only.
        const urlObj = new URL(url)
        if (urlObj.searchParams.has('page')) {
          finalParams.page = urlObj.searchParams.get('page')
        }
      }

      const res = await axios.get(finalUrl, { params: finalParams })

      // Map API response (snake_case) to Staff interface (camelCase)
      const mappedData: Staff[] = res.data.data.map((s: any) => ({
        id: s.employee_id,
        firstName: s.first_name,
        lastName: s.last_name,
        middleName: s.middle_name || '',
        phone: s.phone_number,
        address: s.address,
        status: s.status,
        assignedStatus: s.assigned_status,
        dateHired: s.date_hired,
        role: s.role || 'Employee',
        commissionPercentage: s.commission_percentage || 0,
      }))

      setStaffData({
        ...res.data,
        data: mappedData,
      })
    } catch (error) {
      console.error(error)
      toast.error('Failed to load staff list')
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (url: string) => {
    loadStaffs(url)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadStaffs()
    }, 500)
    return () => clearTimeout(timer)
  }, [search, filter, perPage])

  const formatPhone = (value: string) => value.replace(/\D/g, '').slice(0, 11)

  const resetAddForm = () =>
    setAddForm({
      firstName: '',
      lastName: '',
      middleName: '',
      phone: '',
      address: '',
      commissionPercentage: '',
    })

  const resetEditForm = () => {
    setEditingStaff(null)
    setEditForm({
      firstName: '',
      lastName: '',
      middleName: '',
      phone: '',
      address: '',
      status: 'Active',
      commissionPercentage: '',
    })
  }

  // ---------- CRUD Handlers ----------
  // ---------- CRUD Handlers ----------
  const handleAdd = async () => {
    if (!addForm.firstName || !addForm.lastName || !addForm.phone) return

    try {
      await axios.post('/api/staffs', addForm)

      resetAddForm()
      toast.success('Staff added successfully!')
      loadStaffs() // Reload list (first page or current? searching active?)
    } catch (error) {
      console.error(error)
      toast.error('Failed to add staff')
    }
  }

  const openEdit = (staff: Staff) => {
    setEditingStaff(staff)
    setEditForm({
      ...staff,
      middleName: staff.middleName ?? '',
      commissionPercentage: staff.commissionPercentage.toString(),
    })
  }

  const handleUpdate = async () => {
    if (!editingStaff) return
    try {
      await axios.put(`/staffs/${editingStaff.id}`, editForm)

      resetEditForm()
      toast.success('Staff updated successfully!')
      loadStaffs() // Reload list
    } catch (error) {
      console.error(error)
      toast.error('Failed to update staff')
    }
  }

  const handleDelete = (id: number) => {
    setDeletingStaffId(id)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingStaffId) return
    try {
      await axios.delete(`/staffs/${deletingStaffId}`)
      toast.success('Staff deleted successfully!')
      loadStaffs() // Reload list
    } catch (error) {
      console.error(error)
      toast.error('Failed to delete staff')
    } finally {
      setShowDeleteModal(false)
      setDeletingStaffId(null)
    }
  }

  const loadCommissions = async () => {
    if (!selectedStaffIdForCommission) return

    try {
      setLoadingCommissions(true)
      const res = await axios.get(`/api/staffs/${selectedStaffIdForCommission}/commissions`, {
        params: {
          start_date: commissionStartDate,
          end_date: commissionEndDate,
        },
      })
      setCommissionData(res.data)
    } catch (error) {
      console.error(error)
      toast.error('Failed to load commission data')
    } finally {
      setLoadingCommissions(false)
    }
  }

  const openCommissions = async (id: number) => {
    const { start, end } = getCurrentMonthRange()
    setSelectedStaffIdForCommission(id)
    setCommissionStartDate(start)
    setCommissionEndDate(end)
    setShowCommissionModal(true)
    // loadCommissions will be triggered by useEffect
  }

  useEffect(() => {
    if (showCommissionModal && selectedStaffIdForCommission) {
      loadCommissions()
    }
  }, [showCommissionModal, selectedStaffIdForCommission, commissionStartDate, commissionEndDate])

  const loadWallet = async () => {
    if (!selectedStaffIdForWallet) return
    try {
      setLoadingWallet(true)
      const res = await axios.get(`/api/staffs/${selectedStaffIdForWallet}/wallet`)
      setWalletData(res.data)
    } catch (error) {
      console.error(error)
      toast.error('Failed to load wallet data')
    } finally {
      setLoadingWallet(false)
    }
  }

  const openWallet = (id: number) => {
    setSelectedStaffIdForWallet(id)
    setShowWalletModal(true)
    setPayoutForm({
      amount: '',
      payout_date: new Date().toISOString().split('T')[0],
      remarks: '',
    })
  }

  const handleRecordPayout = async () => {
    if (!selectedStaffIdForWallet || !payoutForm.amount) return
    try {
      setIsSubmittingPayout(true)
      await axios.post(`/api/staffs/${selectedStaffIdForWallet}/payout`, payoutForm)
      toast.success('Payout recorded successfully')
      loadWallet() // Refresh data
    } catch (error) {
      console.error(error)
      toast.error('Failed to record payout')
    } finally {
      setIsSubmittingPayout(false)
    }
  }

  useEffect(() => {
    if (showWalletModal && selectedStaffIdForWallet) {
      loadWallet()
    }
  }, [showWalletModal, selectedStaffIdForWallet])

  /* Removed filteredStaff memo */

  const getStatusVariant = (status: Staff['status']) => {
    switch (status) {
      case 'Active':
        return 'success'
      case 'Inactive':
        return 'destructive'
      case 'Absent':
        return 'warning'
      default:
        return 'secondary'
    }
  }

  const staffToDelete =
    deletingStaffId && staffData?.data ? staffData.data.find((s) => s.id === deletingStaffId) : null

  // ---------- JSX ----------
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Staff Management" />
      <div className="flex flex-col gap-6 p-4">
        <div className="flex items-center justify-between">
          <Heading
            title="Staff Management"
            description="Manage employees and schedules"
          />

          {/*add modal*/}
          {hasPermission('add_employee') && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="highlight">
                  <Plus className="h-4 w-4" /> Add Employee
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    Add{' '}
                    <span className="font-semibold text-yellow-400 dark:text-highlight">
                      Employee
                    </span>
                  </DialogTitle>
                </DialogHeader>

                <div className="grid gap-3 py-2 text-foreground">
                  {/* first name */}
                  <div>
                    <Label>First Name</Label>
                    <Input
                      value={addForm.firstName}
                      onChange={(e) =>
                        setAddForm({
                          ...addForm,
                          firstName: e.target.value,
                        })
                      }
                    />
                  </div>
                  {/*last name*/}
                  <div>
                    <Label>Last Name</Label>
                    <Input
                      value={addForm.lastName}
                      onChange={(e) =>
                        setAddForm({
                          ...addForm,
                          lastName: e.target.value,
                        })
                      }
                    />
                  </div>
                  {/*middle name*/}
                  <div>
                    <Label>Middle Name (optional)</Label>
                    <Input
                      value={addForm.middleName}
                      onChange={(e) =>
                        setAddForm({
                          ...addForm,
                          middleName: e.target.value,
                        })
                      }
                    />
                  </div>
                  {/*phone*/}
                  <div>
                    <Label>Phone Number</Label>
                    <Input
                      value={addForm.phone}
                      onChange={(e) => {
                        const formatted = formatPhone(e.target.value)
                        setAddForm({
                          ...addForm,
                          phone: formatted,
                        })
                      }}
                      maxLength={11}
                    />
                  </div>
                  {/*address*/}
                  <div>
                    <Label>Address</Label>
                    <Input
                      value={addForm.address}
                      onChange={(e) =>
                        setAddForm({
                          ...addForm,
                          address: e.target.value,
                        })
                      }
                    />
                  </div>
                  {/* commission % */}
                  <div>
                    <Label>Commission Percentage (%)</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={addForm.commissionPercentage}
                      onChange={(e) =>
                        setAddForm({
                          ...addForm,
                          commissionPercentage: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <DialogFooter className="flex justify-end gap-3">
                  <DialogClose asChild>
                    <Button
                      variant="secondary"
                      onClick={resetAddForm}
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button
                      variant="highlight"
                      onClick={handleAdd}
                    >
                      Save Employee
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* ... search ... */
        /* Keeping search card logic, it uses search state which is fine */}
        <Card className="border border-border/50 bg-background text-foreground shadow-sm">
          <CardContent className="flex flex-col gap-4 p-5">
            <div className="flex items-center justify-between gap-4 text-foreground">
              <h2 className="text-lg font-bold tracking-tight">Search Employees</h2>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm hover:bg-muted-foreground/10 dark:hover:bg-muted-foreground/20">
                  {filter === 'All' ? 'Filter by: All Status' : `Status: ${filter}`}
                  <ChevronDownIcon className="ml-2 h-4 w-4" />
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-40 border border-border bg-background text-foreground shadow-md">
                  {['All', 'Active', 'Inactive', 'Absent'].map((f) => (
                    <DropdownMenuItem
                      key={f}
                      onClick={() => setFilter(f as typeof filter)}
                      className="cursor-pointer text-foreground hover:bg-muted-foreground/10 dark:hover:bg-muted-foreground/20"
                    >
                      {f === 'All' ? 'All Status' : f}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="relative w-full">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search employees by name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 border-border/50 bg-background pl-10 text-foreground"
              />
            </div>
          </CardContent>
        </Card>

        {/*staff_tbl*/}
        <Card className="border border-sidebar-border/70 bg-background">
          <CardContent className="p-4 text-foreground">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <HeadingSmall
                title="Staff List"
                description={`Total: ${staffData?.total || 0} employee${
                  (staffData?.total || 0) !== 1 ? 's' : ''
                }`}
              />
            </div>

            {loading ? (
              <div className="py-12 text-center">Loading...</div>
            ) : !staffData || staffData.data.length === 0 ? (
              <div className="py-12 text-center">
                <p className="italic">
                  {search || filter !== 'All'
                    ? 'No employees match your search.'
                    : 'No employees yet. Click "Add Employee" to get started.'}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact #</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date Hired</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staffData.data.map((staff) => {
                        const middleInitial = staff.middleName?.trim()
                          ? `${staff.middleName.trim()[0]}.`
                          : ''
                        return (
                          <TableRow key={staff.id}>
                            <TableCell className="font-medium">
                              {staff.firstName} {middleInitial ? `${middleInitial} ` : ''}
                              {staff.lastName}
                            </TableCell>
                            <TableCell>{staff.phone}</TableCell>
                            <TableCell>
                              <Badge variant={getStatusVariant(staff.status)}>{staff.status}</Badge>
                            </TableCell>
                            <TableCell>{staff.dateHired}</TableCell>
                            <TableCell>{staff.address}</TableCell>
                            <TableCell className="font-bold">{staff.role}</TableCell>
                            <TableCell>
                              <div className="flex justify-center gap-3">
                                {/* Edit Modal (Dialog) */}
                                {hasPermission('edit_employee') && (
                                  <Dialog>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <DialogTrigger asChild>
                                            <button
                                              onClick={() => openEdit(staff)}
                                              className="text-foreground hover:text-foreground/80"
                                            >
                                              <Pencil className="h-4 w-4" />
                                            </button>
                                          </DialogTrigger>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Edit Employee</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>

                                    <DialogContent className="sm:max-w-md">
                                      <DialogHeader>
                                        <DialogTitle>
                                          Edit{' '}
                                          <span className="font-semibold text-highlight">
                                            Employee
                                          </span>
                                        </DialogTitle>
                                      </DialogHeader>

                                      <div className="grid gap-3 py-2">
                                        {/* first name */}
                                        <div>
                                          <Label>First Name</Label>
                                          <Input
                                            value={editForm.firstName}
                                            onChange={(e) =>
                                              setEditForm({
                                                ...editForm,
                                                firstName: e.target.value,
                                              })
                                            }
                                          />
                                        </div>
                                        {/*last name*/}
                                        <div>
                                          <Label>Last Name</Label>
                                          <Input
                                            value={editForm.lastName}
                                            onChange={(e) =>
                                              setEditForm({
                                                ...editForm,
                                                lastName: e.target.value,
                                              })
                                            }
                                          />
                                        </div>
                                        {/*middle name*/}
                                        <div>
                                          <Label>Middle Name (optional)</Label>
                                          <Input
                                            value={editForm.middleName}
                                            onChange={(e) =>
                                              setEditForm({
                                                ...editForm,
                                                middleName: e.target.value,
                                              })
                                            }
                                          />
                                        </div>
                                        {/*phone*/}
                                        <div>
                                          <Label>Phone Number</Label>
                                          <Input
                                            value={editForm.phone}
                                            onChange={(e) => {
                                              const formatted = formatPhone(e.target.value)
                                              setEditForm({
                                                ...editForm,
                                                phone: formatted,
                                              })
                                            }}
                                            maxLength={11}
                                          />
                                        </div>
                                        {/*address*/}
                                        <div>
                                          <Label>Address</Label>
                                          <Input
                                            value={editForm.address}
                                            onChange={(e) =>
                                              setEditForm({
                                                ...editForm,
                                                address: e.target.value,
                                              })
                                            }
                                          />
                                        </div>
                                        {/* commission % */}
                                        <div>
                                          <Label>Commission Percentage (%)</Label>
                                          <Input
                                            type="number"
                                            placeholder="0.00"
                                            value={editForm.commissionPercentage}
                                            onChange={(e) =>
                                              setEditForm({
                                                ...editForm,
                                                commissionPercentage: e.target.value,
                                              })
                                            }
                                          />
                                        </div>
                                        {/*status*/}
                                        <div>
                                          <Label>Status</Label>
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <div className="w-full">
                                                  <Select
                                                    value={editForm.status}
                                                    disabled={
                                                      editingStaff?.assignedStatus === 'assigned'
                                                    }
                                                    onValueChange={(value) =>
                                                      setEditForm({
                                                        ...editForm,
                                                        status: value as typeof editForm.status,
                                                      })
                                                    }
                                                  >
                                                    <SelectTrigger className="w-full">
                                                      <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      <SelectItem value="Active">Active</SelectItem>
                                                      <SelectItem value="Inactive">
                                                        Inactive
                                                      </SelectItem>
                                                      <SelectItem value="Absent">Absent</SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                                </div>
                                              </TooltipTrigger>
                                              {editingStaff?.assignedStatus === 'assigned' && (
                                                <TooltipContent>
                                                  <p>
                                                    Status cannot be changed while assigned to a
                                                    service.
                                                  </p>
                                                </TooltipContent>
                                              )}
                                            </Tooltip>
                                          </TooltipProvider>
                                        </div>
                                      </div>

                                      <DialogFooter className="flex justify-end gap-3">
                                        <DialogClose asChild>
                                          <Button
                                            variant="secondary"
                                            onClick={resetEditForm}
                                          >
                                            Cancel
                                          </Button>
                                        </DialogClose>
                                        <DialogClose asChild>
                                          <Button
                                            variant="highlight"
                                            onClick={handleUpdate}
                                          >
                                            Update Employee
                                          </Button>
                                        </DialogClose>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                )}

                                {/* Commissions Action */}
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={() => openCommissions(staff.id)}
                                        className="text-highlight hover:text-highlight/80"
                                      >
                                        <HandCoins className="h-4 w-4" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>View Commissions</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                {/* Wallet Action */}
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={() => openWallet(staff.id)}
                                        className="text-yellow-500 hover:text-yellow-600 dark:text-yellow-400 dark:hover:text-yellow-300"
                                      >
                                        <Wallet className="h-4 w-4" />
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>E-Wallet & Payouts</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                {/*delete*/}
                                {hasPermission('delete_employee') && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={() => handleDelete(staff.id)}
                                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Delete Employee</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
                {/* Pagination */}
                {staffData && (
                  <div className="mt-4 flex flex-col items-center justify-between gap-4 border-t border-border/50 p-4 sm:flex-row">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Rows per page</span>
                      <Select
                        value={perPage.toString()}
                        onValueChange={(v) => setPerPage(Number(v))}
                      >
                        <SelectTrigger className="h-8 w-[70px]">
                          <SelectValue placeholder={perPage} />
                        </SelectTrigger>
                        <SelectContent>
                          {[5, 10, 25, 50, 100].map((pageSize) => (
                            <SelectItem
                              key={pageSize}
                              value={pageSize.toString()}
                            >
                              {pageSize}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Pagination
                      links={staffData.links}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}

            {/* Delete Confirmation Modal */}
            <Dialog
              open={showDeleteModal}
              onOpenChange={setShowDeleteModal}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Delete <span className="text-highlight">Employee</span>
                  </DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete{' '}
                    <span className="font-semibold">
                      {staffToDelete?.firstName} {staffToDelete?.lastName}
                    </span>
                    ? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setShowDeleteModal(false)
                        setDeletingStaffId(null)
                      }}
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    variant="destructive"
                    onClick={handleConfirmDelete}
                  >
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Commission Modal */}
            <Dialog
              open={showCommissionModal}
              onOpenChange={setShowCommissionModal}
            >
              <DialogContent className="w-fit min-w-[850px] border-border/50 bg-background/95 p-0 backdrop-blur-xl transition-all sm:max-w-none">
                <div className="p-5">
                  <DialogHeader className="mb-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <DialogTitle className="text-xl">
                          Staff <span className="text-highlight">Commissions</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground/80">
                          Earned commissions for{' '}
                          <span className="font-semibold text-foreground">
                            {commissionData?.employee}
                          </span>
                        </DialogDescription>
                      </div>

                      {/* Date Filter */}
                      <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/20 p-2">
                        <Input
                          type="date"
                          value={commissionStartDate}
                          onChange={(e) => setCommissionStartDate(e.target.value)}
                          className="h-8 w-[130px] border-none bg-transparent text-[11px] focus-visible:ring-0"
                        />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">
                          to
                        </span>
                        <Input
                          type="date"
                          value={commissionEndDate}
                          onChange={(e) => setCommissionEndDate(e.target.value)}
                          className="h-8 w-[130px] border-none bg-transparent text-[11px] focus-visible:ring-0"
                        />
                      </div>
                    </div>
                  </DialogHeader>

                  <div className="mb-4 grid grid-cols-2 gap-3">
                    <Card className="border-border/50 bg-gradient-to-br from-highlight/5 to-transparent shadow-none">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-bold tracking-wider text-muted-foreground/70 uppercase">
                              Rate
                            </p>
                            <p className="text-xl font-black text-highlight">
                              {commissionData?.commission_percentage}%
                            </p>
                          </div>
                          <div className="rounded-lg bg-highlight/10 p-2 text-highlight">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="m15 5 4 4" />
                              <path d="M13 7 8.7 2.7a2.41 2.41 0 0 0-3.4 0L2.7 5.3a2.41 2.41 0 0 0 0 3.4L7 13" />
                              <path d="m8 6 2-2" />
                              <path d="m2 22 7-7" />
                              <path d="M11 20.3 20.3 11" />
                              <path d="m11 11 9 9" />
                            </svg>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border/50 bg-gradient-to-br from-green-500/5 to-transparent shadow-none">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-bold tracking-wider text-muted-foreground/70 uppercase">
                              Total
                            </p>
                            <p className="text-xl font-black text-green-500">
                              ₱
                              {commissionData?.total_commission.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                              })}
                            </p>
                          </div>
                          <div className="rounded-lg bg-green-500/10 p-2 text-green-500">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line
                                x1="12"
                                y1="2"
                                x2="12"
                                y2="22"
                              />
                              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mb-2">
                    <HeadingSmall
                      title="Completed Jobs"
                      description="Historical record"
                    />
                  </div>

                  <div className="overflow-hidden rounded-lg border border-border/50 bg-muted/10">
                    <div className="max-h-[350px] overflow-y-auto">
                      <Table>
                        <TableHeader className="sticky top-0 z-10 bg-background/95 shadow-sm backdrop-blur-sm">
                          <TableRow className="border-border/30 hover:bg-transparent">
                            <TableHead className="w-[150px] min-w-[150px] px-4 py-3 text-[11px] font-bold tracking-tight whitespace-nowrap uppercase">
                              Date
                            </TableHead>
                            <TableHead className="w-[150px] min-w-[150px] px-4 py-3 text-[11px] font-bold tracking-tight whitespace-nowrap uppercase">
                              Customer
                            </TableHead>
                            <TableHead className="w-auto px-4 py-3 text-[11px] font-bold tracking-tight whitespace-nowrap uppercase">
                              Services
                            </TableHead>
                            <TableHead className="w-[120px] min-w-[120px] px-4 py-3 text-right text-[11px] font-bold tracking-tight whitespace-nowrap uppercase">
                              Total
                            </TableHead>
                            <TableHead className="w-[120px] min-w-[120px] px-4 py-3 text-right text-[11px] font-bold tracking-tight whitespace-nowrap text-highlight uppercase">
                              Comm.
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loadingCommissions ? (
                            <TableRow>
                              <TableCell
                                colSpan={5}
                                className="py-12 text-center"
                              >
                                <div className="flex flex-col items-center gap-2">
                                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-highlight border-t-transparent" />
                                  <p className="text-xs text-muted-foreground">Loading...</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : !commissionData?.orders || commissionData.orders.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={5}
                                className="py-12 text-center"
                              >
                                <p className="text-xs text-muted-foreground italic">
                                  No completed orders found.
                                </p>
                              </TableCell>
                            </TableRow>
                          ) : (
                            commissionData.orders.map((order) => (
                              <TableRow
                                key={order.id}
                                className="group border-border/10 transition-colors hover:bg-highlight/5"
                              >
                                <TableCell className="px-4 py-3 text-[11px] font-medium whitespace-nowrap text-muted-foreground tabular-nums">
                                  {order.date}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-sm font-bold whitespace-nowrap">
                                  {order.customer}
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                  <div className="flex min-w-[200px] flex-wrap gap-1.5">
                                    {order.services.split(',').map((s: string, idx: number) => (
                                      <span
                                        key={idx}
                                        className="inline-block rounded border border-border/20 bg-muted/30 px-1.5 py-0.5 text-[10px] whitespace-nowrap text-muted-foreground/90"
                                      >
                                        {s.trim()}
                                      </span>
                                    ))}
                                  </div>
                                </TableCell>
                                <TableCell className="px-4 py-3 text-right text-sm font-semibold whitespace-nowrap tabular-nums">
                                  ₱{order.total_amount.toLocaleString()}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-right text-sm font-black whitespace-nowrap text-highlight tabular-nums">
                                  ₱
                                  {order.commission_amount.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                  })}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>

                <DialogFooter className="border-t border-border/30 bg-muted/5 p-4">
                  <DialogClose asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-w-[80px] border-border/50 text-xs font-semibold"
                    >
                      Close
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Wallet Modal */}
            <Dialog
              open={showWalletModal}
              onOpenChange={setShowWalletModal}
            >
              <DialogContent className="w-fit min-w-[850px] border-border/50 bg-background/95 p-0 backdrop-blur-xl transition-all sm:max-w-none">
                <div className="p-5">
                  <DialogHeader className="mb-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <DialogTitle className="text-xl">
                          Staff <span className="text-highlight">E-Wallet</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground/80">
                          Wallet balance and payout history for{' '}
                          <span className="font-semibold text-foreground">
                            {walletData?.employee}
                          </span>
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>

                  <div className="mb-6 grid grid-cols-3 gap-3">
                    <Card className="border-border/50 bg-gradient-to-br from-highlight/5 to-transparent shadow-none border-highlight/20">
                      <CardContent className="p-3">
                        <p className="text-[10px] font-bold tracking-wider text-muted-foreground/70 uppercase">Lifetime Earned</p>
                        <p className="text-xl font-black text-highlight">₱{walletData?.total_earned.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      </CardContent>
                    </Card>

                    <Card className="border-border/50 bg-gradient-to-br from-red-500/5 to-transparent shadow-none border-red-500/20">
                      <CardContent className="p-3">
                        <p className="text-[10px] font-bold tracking-wider text-muted-foreground/70 uppercase">Total Paid Out</p>
                        <p className="text-xl font-black text-red-500">₱{walletData?.total_paid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      </CardContent>
                    </Card>

                    <Card className="border-border/50 bg-gradient-to-br from-green-500/5 to-transparent shadow-none border-green-500/30">
                      <CardContent className="p-3">
                        <p className="text-[10px] font-bold tracking-wider text-muted-foreground/70 uppercase text-green-600">Remaining Balance</p>
                        <p className="text-2xl font-black text-green-600">₱{walletData?.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Record Payout Form */}
                    <div className="flex flex-col gap-4">
                      <div className="rounded-xl border border-border/50 bg-muted/5 p-4 shadow-sm">
                        <HeadingSmall title="Record Payout" description="Distribute commission to staff" />
                        <div className="mt-4 grid gap-4">
                          <div className="grid gap-2">
                            <Label className="text-xs font-semibold">Payout Amount (₱)</Label>
                            <Input 
                              type="number" 
                              placeholder="0.00"
                              value={payoutForm.amount}
                              onChange={(e) => setPayoutForm({...payoutForm, amount: e.target.value})}
                              className="bg-background/50 focus:bg-background h-10 transition-all font-medium"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label className="text-xs font-semibold">Payout Date</Label>
                            <Input 
                              type="date"
                              value={payoutForm.payout_date}
                              onChange={(e) => setPayoutForm({...payoutForm, payout_date: e.target.value})}
                              className="bg-background/50 focus:bg-background h-10 transition-all"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label className="text-xs font-semibold">Remarks/Notes</Label>
                            <Input 
                              placeholder="e.g. Weekly payout"
                              value={payoutForm.remarks}
                              onChange={(e) => setPayoutForm({...payoutForm, remarks: e.target.value})}
                              className="bg-background/50 focus:bg-background h-10 transition-all"
                            />
                          </div>
                          <Button 
                            variant="highlight" 
                            size="lg"
                            className="mt-2 font-bold shadow-lg shadow-highlight/20"
                            onClick={handleRecordPayout}
                            disabled={isSubmittingPayout || !payoutForm.amount}
                          >
                            {isSubmittingPayout ? 'Processing...' : 'Confirm Payout'}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Payout History */}
                    <div className="flex flex-col gap-4">
                      <div className="flex-1 rounded-xl border border-border/50 bg-muted/10 p-4 shadow-inner overflow-hidden">
                        <HeadingSmall title="Payout History" description="Record of previous payouts" />
                        <div className="mt-4 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                          <Table>
                            <TableHeader className="sticky top-0 z-10 bg-background/95 shadow-sm backdrop-blur-sm">
                              <TableRow className="border-border/30 hover:bg-transparent">
                                <TableHead className="px-3 py-2 text-[10px] font-bold tracking-widest uppercase">Date</TableHead>
                                <TableHead className="px-3 py-2 text-[10px] font-bold tracking-widest uppercase">Amount</TableHead>
                                <TableHead className="px-3 py-2 text-[10px] font-bold tracking-widest uppercase">Remarks</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {loadingWallet ? (
                                <TableRow>
                                  <TableCell colSpan={3} className="py-12 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-highlight border-t-transparent" />
                                      <span className="loading-text text-xs">Fetching history...</span>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ) : !walletData?.payouts || walletData.payouts.length === 0 ? (
                                <TableRow><TableCell colSpan={3} className="py-12 text-center text-xs italic text-muted-foreground/60 bg-muted/5 rounded-lg">No payouts recorded yet.</TableCell></TableRow>
                              ) : (
                                walletData.payouts.map((p) => (
                                  <TableRow key={p.payout_id} className="text-[11px] group transition-all hover:bg-highlight/5 border-border/10">
                                    <TableCell className="px-3 py-3 font-semibold tabular-nums text-muted-foreground">{new Date(p.payout_date).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })}</TableCell>
                                    <TableCell className="px-3 py-3 font-black text-red-500 tabular-nums">₱{parseFloat(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell className="px-3 py-3 text-muted-foreground/80 font-medium">
                                      <div className="max-w-[140px] truncate" title={p.remarks}>{p.remarks || '-'}</div>
                                    </TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter className="border-t border-border/30 bg-muted/5 p-4">
                  <DialogClose asChild>
                    <Button variant="outline" size="sm" className="min-w-[100px] text-xs font-bold uppercase tracking-wider transition-all hover:bg-muted">Close Wallet</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
