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
import AppLayout from '@/layouts/app-layout'
import { Head } from '@inertiajs/react'
import axios from 'axios'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
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

  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<Staff[]>([])
  const searchRef = useRef<HTMLDivElement>(null)

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
      let finalParams = { ...params }
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

  // Suggestions (simplified - fetches directly or filters current page?)
  // For simplicity, we might just filter current loaded data or remove suggestions if not checking API.
  // The original implementation filtered local list.
  // With pagination, suggestions should ideally come from API.
  // For now, I'll remove suggestions logic or keep it searching on CURRENT page only?
  // I will just search on CURRENT loaded data for suggestions.
  useEffect(() => {
    if (search.length > 0 && staffData?.data) {
      const matches = staffData.data.filter((s) => {
        const fullName = `${s.firstName} ${s.middleName ?? ''} ${s.lastName}`.toLowerCase()
        return fullName.includes(search.toLowerCase())
      })
      setSuggestions(matches.slice(0, 5))
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [search, staffData])

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

  const handleSuggestionClick = (staff: Staff) => {
    setSearch(`${staff.firstName} ${staff.middleName ?? ''} ${staff.lastName}`)
    setShowSuggestions(false)
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
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="highlight">
                <Plus className="h-4 w-4" /> Add Employee
              </Button>
            </DialogTrigger>
            {/* ... modal content unchanged ... */
            /* Actually I can't easily skip modal content without matching it. 
                I'll keep the modal content as is by matching surrounding code? 
                The modal is huge.
                I will only replace the top part (filteredStaff) and the table part separately. */}
          </Dialog>
        </div>

        {/* ... search ... */
        /* Keeping search card logic, it uses search state which is fine */}
        <Card className="border border-border/70 bg-background">
          <CardContent className="p-4 text-foreground">
            {/* ... Search input ... */}
            <div
              ref={searchRef}
              className="relative w-full"
            >
              <Label className="mb-1 block text-sm">Search Employees</Label>
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Search by name or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => search.length > 0 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  className="pl-10"
                />
                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="custom-scrollbar absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-background shadow-lg">
                    {suggestions.map((staff) => {
                      const fullName = `${staff.firstName} ${staff.middleName ?? ''} ${staff.lastName}`
                      return (
                        <div
                          key={staff.id}
                          className="cursor-pointer border-b border-border/50 p-3 last:border-b-0 hover:bg-accent/50"
                          onClick={() => handleSuggestionClick(staff)}
                        >
                          <div className="font-medium text-foreground">{fullName}</div>
                          <div className="text-xs text-muted-foreground">{staff.phone}</div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
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

              <Select
                value={filter}
                onValueChange={(value) => setFilter(value as typeof filter)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by: All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                </SelectContent>
              </Select>
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
                                        <Select
                                          value={editForm.status}
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

                                {/*delete*/}
                                <button
                                  onClick={() => handleDelete(staff.id)}
                                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
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
