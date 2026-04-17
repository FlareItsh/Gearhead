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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { usePermissions } from '@/hooks/use-permissions'
import AppLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'
import axios from 'axios'
import { ChevronDownIcon, Pencil, Plus, Search, Trash2 } from 'lucide-react'
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
    firstName: '',
    lastName: '',
    middleName: '',
    phone: '',
    address: '',
  })
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    phone: '',
    address: '',
    status: 'Active' as Staff['status'],
  })

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingStaffId, setDeletingStaffId] = useState<number | null>(null)

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
                    Add <span className="font-semibold text-yellow-400 dark:text-highlight">Employee</span>
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

                <DropdownMenuContent className="w-40 border border-border bg-background shadow-md text-foreground">
                  {['All', 'Active', 'Inactive', 'Absent'].map((f) => (
                    <DropdownMenuItem
                      key={f}
                      onClick={() => setFilter(f as typeof filter)}
                      className="text-foreground hover:bg-muted-foreground/10 dark:hover:bg-muted-foreground/20 cursor-pointer"
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
                                    <DialogTrigger asChild>
                                      <button
                                        onClick={() => openEdit(staff)}
                                        className=""
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </button>
                                    </DialogTrigger>

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
                                        {/*status*/}
                                        <div>
                                          <Label>Status</Label>
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <div className="w-full">
                                                  <Select
                                                    value={editForm.status}
                                                    disabled={editingStaff?.assignedStatus === 'assigned'}
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
                                                      <SelectItem value="Inactive">Inactive</SelectItem>
                                                      <SelectItem value="Absent">Absent</SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                                </div>
                                              </TooltipTrigger>
                                              {editingStaff?.assignedStatus === 'assigned' && (
                                                <TooltipContent>
                                                  <p>Status cannot be changed while assigned to a service.</p>
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

                                {/*delete*/}
                                {hasPermission('delete_employee') && (
                                  <button
                                    onClick={() => handleDelete(staff.id)}
                                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
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
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
