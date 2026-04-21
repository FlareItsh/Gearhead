import InputError from '@/components/input-error'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Discount, type BreadcrumbItem } from '@/types'
import { Transition } from '@headlessui/react'
import { Head, useForm } from '@inertiajs/react'
import {
  Clock,
  CreditCard,
  Edit2,
  Gift,
  LoaderCircle,
  Plus,
  QrCode,
  Tag,
  Trash2,
  Upload,
} from 'lucide-react'
import { useState } from 'react'

interface GcashSettings {
  account_name: string
  account_number: string
  qr_code_path: string | null
  qr_code_url: string | null
}

interface ModerationProps {
  loyaltyThreshold: number
  gcashSettings: GcashSettings
  discounts: Discount[]
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Moderation',
    href: '/moderation',
  },
]

export default function Moderation({
  loyaltyThreshold,
  gcashSettings,
  discounts,
}: ModerationProps) {
  // Loyalty Form
  const loyaltyForm = useForm({
    threshold: loyaltyThreshold,
  })

  const submitLoyalty = (e: React.FormEvent) => {
    e.preventDefault()
    loyaltyForm.post(route('admin.moderation.loyalty'), {
      preserveScroll: true,
    })
  }

  // GCash Form
  const [preview, setPreview] = useState<string | null>(gcashSettings.qr_code_url)
  const gcashForm = useForm({
    account_name: gcashSettings.account_name,
    account_number: gcashSettings.account_number,
    qr_code: null as File | null,
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      gcashForm.setData('qr_code', file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const submitGcash = (e: React.FormEvent) => {
    e.preventDefault()
    gcashForm.post(route('admin.moderation.gcash'), {
      preserveScroll: true,
      forceFormData: true,
    })
  }

  // Discount Form
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const discountForm = useForm({
    name: '',
    type: 'percentage' as 'fixed' | 'percentage',
    value: 0,
    valid_from: '',
    valid_to: '',
    is_active: true,
  })

  const openCreateDialog = () => {
    setEditingDiscount(null)
    discountForm.reset()
    setIsDialogOpen(true)
  }

  const openEditDialog = (discount: Discount) => {
    setEditingDiscount(discount)
    discountForm.setData({
      name: discount.name,
      type: discount.type,
      value: discount.value,
      valid_from: discount.valid_from ? discount.valid_from.substring(0, 16) : '',
      valid_to: discount.valid_to ? discount.valid_to.substring(0, 16) : '',
      is_active: discount.is_active,
    })
    setIsDialogOpen(true)
  }

  const submitDiscount = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingDiscount) {
      discountForm.put(route('admin.moderation.discounts.update', editingDiscount.discount_id), {
        onSuccess: () => setIsDialogOpen(false),
        preserveScroll: true,
      })
    } else {
      discountForm.post(route('admin.moderation.discounts.store'), {
        onSuccess: () => setIsDialogOpen(false),
        preserveScroll: true,
      })
    }
  }

  const deleteDiscount = (id: number) => {
    if (confirm('Are you sure you want to delete this discount?')) {
      useForm().delete(route('admin.moderation.discounts.destroy', id), {
        preserveScroll: true,
      })
    }
  }

  const getStatusBadge = (discount: Discount) => {
    const now = new Date()
    const from = discount.valid_from ? new Date(discount.valid_from) : null
    const to = discount.valid_to ? new Date(discount.valid_to) : null

    if (!discount.is_active) {
      return <Badge variant="destructive">Inactive</Badge>
    }
    if (from && from > now) {
      return <Badge variant="secondary">Upcoming</Badge>
    }
    if (to && to < now) {
      return <Badge variant="outline">Expired</Badge>
    }
    return <Badge variant="highlight">Active</Badge>
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Moderation" />

      <div className="space-y-8 p-6 lg:p-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Moderation Hub</h1>
          <p className="text-muted-foreground">Manage application-wide rules and settings.</p>
        </div>

        <div className="grid gap-8">
          {/* Loyalty Settings */}
          <Card>
            <CardHeader className="py-6">
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-highlight" />
                Loyalty Points
              </CardTitle>
              <CardDescription>
                Configure the criteria for the free wash loyalty points.
              </CardDescription>
            </CardHeader>
            <CardContent className="py-8">
              <form
                onSubmit={submitLoyalty}
                className="space-y-4"
              >
                <div className="max-w-md space-y-2">
                  <Label htmlFor="threshold">Free Wash Threshold</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <span className="absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                          Every
                        </span>
                        <Input
                          id="threshold"
                          type="number"
                          className="pr-24 pl-14"
                          value={loyaltyForm.data.threshold}
                          onChange={(e) =>
                            loyaltyForm.setData('threshold', parseInt(e.target.value))
                          }
                          required
                          min="1"
                          max="100"
                        />
                        <span className="absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
                          wash is free
                        </span>
                      </div>
                    </div>
                    <Button
                      disabled={loyaltyForm.processing}
                      variant="highlight"
                    >
                      {loyaltyForm.processing && (
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Update
                    </Button>
                  </div>
                  <InputError message={loyaltyForm.errors.threshold} />
                  <Transition
                    show={loyaltyForm.recentlySuccessful}
                    enter="transition ease-in-out"
                    enterFrom="opacity-0"
                    leave="transition ease-in-out"
                    leaveTo="opacity-0"
                  >
                    <p className="text-sm text-green-600">Loyalty threshold updated!</p>
                  </Transition>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* GCash Settings */}
          <Card>
            <CardHeader className="py-6">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-highlight" />
                Shop GCash Information
              </CardTitle>
              <CardDescription>
                Update the GCash account details displayed to customers at checkout.
              </CardDescription>
            </CardHeader>
            <CardContent className="py-8">
              <form
                onSubmit={submitGcash}
                className="space-y-6"
              >
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="account_name">GCash Account Name</Label>
                      <Input
                        id="account_name"
                        value={gcashForm.data.account_name}
                        onChange={(e) => gcashForm.setData('account_name', e.target.value)}
                        required
                        placeholder="e.g. JUAN DELA CRUZ"
                      />
                      <InputError message={gcashForm.errors.account_name} />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="account_number">GCash Phone Number</Label>
                      <Input
                        id="account_number"
                        value={gcashForm.data.account_number}
                        onChange={(e) => gcashForm.setData('account_number', e.target.value)}
                        required
                        placeholder="e.g. 09123456789"
                      />
                      <InputError message={gcashForm.errors.account_number} />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>QR Code Image</Label>
                    <div className="mt-2 flex items-start gap-6">
                      <div className="relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50">
                        {preview ? (
                          <img
                            src={preview}
                            alt="QR Code"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <QrCode className="h-8 w-8" />
                            <span className="text-xs">No QR Code</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-4">
                        <Label
                          htmlFor="qr_code"
                          className="flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                        >
                          <Upload className="h-4 w-4" />
                          {preview ? 'Change QR Image' : 'Upload QR Image'}
                          <input
                            id="qr_code"
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                            accept="image/*"
                          />
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          JPG, PNG or GIF. Max size 2MB.
                        </p>
                        <InputError message={gcashForm.errors.qr_code} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    disabled={gcashForm.processing}
                    variant="highlight"
                  >
                    {gcashForm.processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                    Save GCash Settings
                  </Button>

                  <Transition
                    show={gcashForm.recentlySuccessful}
                    enter="transition ease-in-out"
                    enterFrom="opacity-0"
                    leave="transition ease-in-out"
                    leaveTo="opacity-0"
                  >
                    <p className="text-sm text-green-600">GCash info updated!</p>
                  </Transition>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Global Discounts */}
          <Card>
            <CardHeader className="py-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-highlight" />
                    Global Discounts
                  </CardTitle>
                  <CardDescription>
                    Apply discounts to all services. Active discounts automatically apply at
                    checkout.
                  </CardDescription>
                </div>
                <Button
                  variant="highlight"
                  onClick={openCreateDialog}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Discount
                </Button>
              </div>
            </CardHeader>
            <CardContent className="py-8">
              <Dialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
              >
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>
                      {editingDiscount ? 'Edit Discount' : 'Create New Discount'}
                    </DialogTitle>
                    <DialogDescription>
                      Configure a promotional discount for all services.
                    </DialogDescription>
                  </DialogHeader>
                  <form
                    onSubmit={submitDiscount}
                    className="space-y-4 py-4"
                  >
                    <div className="grid gap-2">
                      <Label htmlFor="discount_name">Discount Name</Label>
                      <Input
                        id="discount_name"
                        value={discountForm.data.name}
                        onChange={(e) => discountForm.setData('name', e.target.value)}
                        placeholder="e.g. Summer Special"
                        required
                      />
                      <InputError message={discountForm.errors.name} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="discount_type">Type</Label>
                        <Select
                          value={discountForm.data.type}
                          onValueChange={(val: any) => discountForm.setData('type', val)}
                        >
                          <SelectTrigger id="discount_type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                            <SelectItem value="fixed">Fixed (₱)</SelectItem>
                          </SelectContent>
                        </Select>
                        <InputError message={discountForm.errors.type} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="discount_value">Value</Label>
                        <Input
                          id="discount_value"
                          type="number"
                          step="0.01"
                          value={discountForm.data.value}
                          onChange={(e) =>
                            discountForm.setData('value', parseFloat(e.target.value))
                          }
                          required
                        />
                        <InputError message={discountForm.errors.value} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="valid_from">Valid From (Optional)</Label>
                        <Input
                          id="valid_from"
                          type="datetime-local"
                          value={discountForm.data.valid_from}
                          onChange={(e) => discountForm.setData('valid_from', e.target.value)}
                        />
                        <InputError message={discountForm.errors.valid_from} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="valid_to">Valid To (Optional)</Label>
                        <Input
                          id="valid_to"
                          type="datetime-local"
                          value={discountForm.data.valid_to}
                          onChange={(e) => discountForm.setData('valid_to', e.target.value)}
                        />
                        <InputError message={discountForm.errors.valid_to} />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={discountForm.data.is_active}
                        onChange={(e) => discountForm.setData('is_active', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-highlight focus:ring-highlight"
                      />
                      <Label htmlFor="is_active">Enable this discount</Label>
                    </div>
                  </form>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="highlight"
                      onClick={submitDiscount}
                      disabled={discountForm.processing}
                    >
                      {discountForm.processing && (
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {editingDiscount ? 'Update Discount' : 'Create Discount'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Discount Name</TableHead>
                      <TableHead>Reduction</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {discounts.length > 0 ? (
                      discounts.map((discount) => (
                        <TableRow key={discount.discount_id}>
                          <TableCell className="font-medium">{discount.name}</TableCell>
                          <TableCell>
                            {discount.type === 'percentage'
                              ? `${discount.value}%`
                              : `₱${parseFloat(discount.value.toString()).toLocaleString()}`}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {discount.valid_from
                                  ? new Date(discount.valid_from).toLocaleDateString()
                                  : 'Always'}
                                {' — '}
                                {discount.valid_to
                                  ? new Date(discount.valid_to).toLocaleDateString()
                                  : 'No Expiry'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(discount)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(discount)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => deleteDiscount(discount.discount_id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="h-24 text-center text-muted-foreground"
                        >
                          No discounts found. Create your first promotion above!
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
