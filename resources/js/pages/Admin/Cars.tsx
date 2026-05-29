import Heading from '@/components/heading'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { type BreadcrumbItem } from '@/types'
import { Head, Link, router, useForm } from '@inertiajs/react'
import { Edit2, Plus, Search, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Car Library', href: '/cars' }]

interface CarReference {
  id: number
  make: string
  model: string
  size: 'Small' | 'Medium' | 'Large' | 'X-Large' | 'XX-Large'
  created_at?: string
  updated_at?: string
}

interface PaginationLink {
  url: string | null
  label: string
  active: boolean
}

interface CarsResponse {
  data: CarReference[]
  current_page: number
  last_page: number
  next_page_url: string | null
  prev_page_url: string | null
  links: PaginationLink[]
  total: number
}

interface CarsProps {
  cars: CarsResponse
  filters: {
    search: string
    size: string
  }
}

export default function Cars({ cars, filters }: CarsProps) {
  const [search, setSearch] = useState(filters.search || '')
  const [sizeFilter, setSizeFilter] = useState(filters.size || 'All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedCar, setSelectedCar] = useState<CarReference | null>(null)

  // Add Form
  const addForm = useForm({
    make: '',
    model: '',
    size: 'Small' as 'Small' | 'Medium' | 'Large' | 'X-Large' | 'XX-Large',
  })

  // Edit Form
  const editForm = useForm({
    make: '',
    model: '',
    size: 'Small' as 'Small' | 'Medium' | 'Large' | 'X-Large' | 'XX-Large',
  })

  // Handle Search and Filter Query Updates
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      router.get('/cars', { search, size: sizeFilter }, { preserveState: true, replace: true })
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [search, sizeFilter])

  // Handle Add Submission
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addForm.post('/cars', {
      onSuccess: () => {
        toast.success('Car added successfully to references!')
        setShowAddModal(false)
        addForm.reset()
      },
      onError: (errors) => {
        const firstError = Object.values(errors)[0]
        if (firstError) toast.error(firstError)
      },
    })
  }

  // Handle Edit Open
  const openEditModal = (car: CarReference) => {
    setSelectedCar(car)
    editForm.setData({
      make: car.make,
      model: car.model,
      size: car.size,
    })
    setShowEditModal(true)
  }

  // Handle Edit Submission
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCar) return

    editForm.put(`/cars/${selectedCar.id}`, {
      onSuccess: () => {
        toast.success('Car updated successfully!')
        setShowEditModal(false)
        editForm.reset()
      },
      onError: (errors) => {
        const firstError = Object.values(errors)[0]
        if (firstError) toast.error(firstError)
      },
    })
  }

  // Handle Delete Open
  const openDeleteModal = (car: CarReference) => {
    setSelectedCar(car)
    setShowDeleteModal(true)
  }

  // Handle Delete Confirmation
  const handleDeleteConfirm = () => {
    if (!selectedCar) return

    router.delete(`/cars/${selectedCar.id}`, {
      onSuccess: () => {
        toast.success('Car deleted successfully from library!')
        setShowDeleteModal(false)
      },
      onError: () => {
        toast.error('Failed to delete car reference.')
      },
    })
  }

  // Helper to color-code vehicle sizes
  const getSizeBadgeVariant = (size: string) => {
    switch (size) {
      case 'Small':
        return 'success'
      case 'Medium':
        return 'info'
      case 'Large':
        return 'warning'
      case 'X-Large':
        return 'destructive'
      case 'XX-Large':
        return 'destructive'
      default:
        return 'default'
    }
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Car Library Reference" />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Heading
            title="Car Library"
            description="Manage and maintain reference models and sizing definitions for vehicles."
          />
          <Button
            variant="highlight"
            onClick={() => setShowAddModal(true)}
            className="flex h-11 w-full items-center justify-center gap-2 shadow-lg shadow-yellow-500/10 transition-all hover:shadow-yellow-500/20 active:scale-[0.98] sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Add Reference Car
          </Button>
        </div>

        {/* Filters Panel */}
        <Card className="border border-border/40 bg-card/60 backdrop-blur-md">
          <CardContent className="flex flex-col items-stretch justify-between gap-4 p-4 md:flex-row md:items-center">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by make or model..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 rounded-lg border-border/40 bg-background/50 pl-10 transition-all focus:border-yellow-500/50"
              />
            </div>

            {/* Size Filter */}
            <div className="flex w-full flex-col items-stretch gap-2 sm:flex-row sm:items-center md:w-56">
              <Label className="hidden text-sm font-medium whitespace-nowrap text-muted-foreground sm:inline">
                Size:
              </Label>
              <Select
                value={sizeFilter}
                onValueChange={setSizeFilter}
              >
                <SelectTrigger className="h-11 rounded-lg border-border/40 bg-background/50 focus:border-yellow-500/50">
                  <SelectValue placeholder="All Sizes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Sizes</SelectItem>
                  <SelectItem value="Small">Small</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Large">Large</SelectItem>
                  <SelectItem value="X-Large">X-Large</SelectItem>
                  <SelectItem value="XX-Large">XX-Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Cars List Table */}
        <Card className="overflow-hidden rounded-2xl border border-border/40 bg-card/40 backdrop-blur-md">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-border/40 bg-muted/40">
                <TableRow>
                  <TableHead className="py-4 pl-6 font-semibold text-foreground">Make</TableHead>

                  <TableHead className="px-4 py-4 font-semibold text-foreground">Model</TableHead>

                  <TableHead className="px-4 py-4 font-semibold text-foreground">
                    Sizing Class
                  </TableHead>

                  <TableHead className="py-4 pr-6 text-right font-semibold text-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cars.data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-32 text-center text-muted-foreground"
                    >
                      No reference cars match your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  cars.data.map((car) => (
                    <TableRow
                      key={car.id}
                      className="border-b border-border/30 transition-colors hover:bg-muted/10"
                    >
                      <TableCell className="py-4 pl-6 font-medium text-foreground">
                        {car.make}
                      </TableCell>
                      <TableCell className="py-4 text-muted-foreground">{car.model}</TableCell>
                      <TableCell className="py-4">
                        <Badge
                          variant={getSizeBadgeVariant(car.size)}
                          className="rounded-full px-3 py-1 text-xs font-semibold"
                        >
                          {car.size}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(car)}
                            className="h-9 w-9 rounded-lg text-muted-foreground transition-all hover:bg-yellow-500/10 hover:text-yellow-500 dark:hover:text-yellow-400"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteModal(car)}
                            className="h-9 w-9 rounded-lg text-muted-foreground transition-all hover:bg-red-500/10 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {cars.links && cars.links.length > 3 && (
            <div className="flex flex-col items-center justify-between gap-4 border-t border-border/40 bg-muted/20 p-4 sm:flex-row">
              <p className="text-sm text-muted-foreground">
                Showing page{' '}
                <span className="font-semibold text-foreground">{cars.current_page}</span> of{' '}
                <span className="font-semibold text-foreground">{cars.last_page}</span> (Total{' '}
                {cars.total} reference cars)
              </p>
              <div className="flex flex-wrap items-center gap-1.5">
                {cars.links.map((link, i) => (
                  <Link
                    key={i}
                    href={link.url || '#'}
                    disabled={!link.url}
                    preserveState
                    preserveScroll
                    className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all ${
                      link.active
                        ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/15'
                        : 'border border-border/30 bg-background text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                    } ${!link.url ? 'pointer-events-none cursor-not-allowed opacity-40' : ''}`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Add Reference Modal */}
      <Dialog
        open={showAddModal}
        onOpenChange={setShowAddModal}
      >
        <DialogContent className="rounded-2xl border border-border/40 bg-card sm:max-w-md">
          <form onSubmit={handleAddSubmit}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-foreground">
                Add Reference <span className="text-yellow-500">Vehicle</span>
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-5 py-5">
              {/* Make Input */}
              <div className="grid gap-2">
                <Label
                  htmlFor="make"
                  className="text-sm font-semibold"
                >
                  Make (Brand)
                </Label>
                <Input
                  id="make"
                  placeholder="e.g., Toyota, Honda, BYD"
                  value={addForm.data.make}
                  onChange={(e) => addForm.setData('make', e.target.value)}
                  className="h-11 bg-background/50"
                  required
                />
                {addForm.errors.make && (
                  <p className="text-xs font-medium text-red-500">{addForm.errors.make}</p>
                )}
              </div>

              {/* Model Input */}
              <div className="grid gap-2">
                <Label
                  htmlFor="model"
                  className="text-sm font-semibold"
                >
                  Model
                </Label>
                <Input
                  id="model"
                  placeholder="e.g., Vios, Civic, Atto 3"
                  value={addForm.data.model}
                  onChange={(e) => addForm.setData('model', e.target.value)}
                  className="h-11 bg-background/50"
                  required
                />
                {addForm.errors.model && (
                  <p className="text-xs font-medium text-red-500">{addForm.errors.model}</p>
                )}
              </div>

              {/* Size Select */}
              <div className="grid gap-2">
                <Label
                  htmlFor="size"
                  className="text-sm font-semibold"
                >
                  Vehicle Size Classification
                </Label>
                <Select
                  value={addForm.data.size}
                  onValueChange={(value) => addForm.setData('size', value as any)}
                >
                  <SelectTrigger className="h-11 bg-background/50">
                    <SelectValue placeholder="Select vehicle size class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Small">Small (e.g., Wigo, Mirage, Dolphin)</SelectItem>
                    <SelectItem value="Medium">Medium (e.g., Vios, Civic, CS35)</SelectItem>
                    <SelectItem value="Large">Large (e.g., Fortuner, Innova, Everest)</SelectItem>
                    <SelectItem value="X-Large">X-Large (e.g., Hiace, D-Max, Triton)</SelectItem>
                    <SelectItem value="XX-Large">
                      XX-Large (e.g., F-150, Traditional Jeepney)
                    </SelectItem>
                  </SelectContent>
                </Select>
                {addForm.errors.size && (
                  <p className="text-xs font-medium text-red-500">{addForm.errors.size}</p>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-11 font-medium"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                variant="highlight"
                className="h-11 font-semibold"
                disabled={addForm.processing}
              >
                {addForm.processing ? 'Adding...' : 'Add reference'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Reference Modal */}
      <Dialog
        open={showEditModal}
        onOpenChange={setShowEditModal}
      >
        <DialogContent className="rounded-2xl border border-border/40 bg-card sm:max-w-md">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-foreground">
                Edit Reference <span className="text-yellow-500">Vehicle</span>
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-5 py-5">
              {/* Make Input */}
              <div className="grid gap-2">
                <Label
                  htmlFor="edit_make"
                  className="text-sm font-semibold"
                >
                  Make (Brand)
                </Label>
                <Input
                  id="edit_make"
                  placeholder="e.g., Toyota, Honda"
                  value={editForm.data.make}
                  onChange={(e) => editForm.setData('make', e.target.value)}
                  className="h-11 bg-background/50"
                  required
                />
                {editForm.errors.make && (
                  <p className="text-xs font-medium text-red-500">{editForm.errors.make}</p>
                )}
              </div>

              {/* Model Input */}
              <div className="grid gap-2">
                <Label
                  htmlFor="edit_model"
                  className="text-sm font-semibold"
                >
                  Model
                </Label>
                <Input
                  id="edit_model"
                  placeholder="e.g., Vios, Civic"
                  value={editForm.data.model}
                  onChange={(e) => editForm.setData('model', e.target.value)}
                  className="h-11 bg-background/50"
                  required
                />
                {editForm.errors.model && (
                  <p className="text-xs font-medium text-red-500">{editForm.errors.model}</p>
                )}
              </div>

              {/* Size Select */}
              <div className="grid gap-2">
                <Label
                  htmlFor="edit_size"
                  className="text-sm font-semibold"
                >
                  Vehicle Size Classification
                </Label>
                <Select
                  value={editForm.data.size}
                  onValueChange={(value) => editForm.setData('size', value as any)}
                >
                  <SelectTrigger className="h-11 bg-background/50">
                    <SelectValue placeholder="Select vehicle size class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Small">Small (e.g., Wigo, Mirage, Dolphin)</SelectItem>
                    <SelectItem value="Medium">Medium (e.g., Vios, Civic, CS35)</SelectItem>
                    <SelectItem value="Large">Large (e.g., Fortuner, Innova, Everest)</SelectItem>
                    <SelectItem value="X-Large">X-Large (e.g., Hiace, D-Max, Triton)</SelectItem>
                    <SelectItem value="XX-Large">
                      XX-Large (e.g., F-150, Traditional Jeepney)
                    </SelectItem>
                  </SelectContent>
                </Select>
                {editForm.errors.size && (
                  <p className="text-xs font-medium text-red-500">{editForm.errors.size}</p>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-11 font-medium"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                variant="highlight"
                className="h-11 font-semibold"
                disabled={editForm.processing}
              >
                {editForm.processing ? 'Saving...' : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
      >
        <DialogContent className="rounded-2xl border border-border/40 bg-card sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              Remove from Library
            </DialogTitle>
          </DialogHeader>

          <div className="py-2">
            <p className="text-center text-sm leading-relaxed text-muted-foreground">
              Are you sure you want to remove{' '}
              <span className="font-semibold text-foreground">
                {selectedCar?.make} {selectedCar?.model}
              </span>{' '}
              from the reference library? This can't be undone.
            </p>
          </div>

          <DialogFooter className="mt-3 flex gap-2 sm:flex-row sm:gap-0">
            <DialogClose asChild>
              <Button
                type="button"
                variant="secondary"
                className="h-11 flex-1 font-medium"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              className="h-11 flex-1 font-semibold"
            >
              Delete Reference
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
