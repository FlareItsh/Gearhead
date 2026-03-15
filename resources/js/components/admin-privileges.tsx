import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

export const PRIVILEGES = [
  { id: 'view_dashboard', label: 'View Dashboard' },
  {
    id: 'view_registry',
    label: 'View Registry',
    children: [
      { id: 'start_service', label: 'Start Service' },
      { id: 'add_queue', label: 'Add Queue' },
    ],
  },
  { id: 'view_bookings', label: 'View Bookings' },
  {
    id: 'view_bays',
    label: 'View Bays',
    children: [
      { id: 'edit_bay', label: 'Edit Bay' },
      { id: 'delete_bay', label: 'Delete Bay' },
      { id: 'add_bay', label: 'Add Bay' },
    ],
  },
  {
    id: 'view_services',
    label: 'View Services',
    children: [
      { id: 'add_service', label: 'Add Service' },
      { id: 'edit_service', label: 'Edit Service' },
    ],
  },
  {
    id: 'view_inventory',
    label: 'View Inventory',
    children: [
      { id: 'export_inventory_pdf', label: 'Export PDF' },
      { id: 'add_inventory_item', label: 'Add Item' },
      { id: 'add_inventory_purchase', label: 'Add Purchase' },
      { id: 'pullout_inventory_request', label: 'Pullout Request' },
      { id: 'add_inventory_supplier', label: 'Add Supplier' },
      { id: 'edit_inventory_item', label: 'Edit Item' },
    ],
  },
  {
    id: 'view_pullout_requests',
    label: 'View Pullout Requests',
    children: [
      { id: 'approve_pullout_request', label: 'Approve Request' },
      { id: 'mark_return_pullout', label: 'Mark Return' },
    ],
  },
  {
    id: 'view_users',
    label: 'View Users',
    children: [{ id: 'edit_user', label: 'Edit Customer/User' }],
  },
  {
    id: 'view_employees',
    label: 'View Employees',
    children: [
      { id: 'add_employee', label: 'Add Employee' },
      { id: 'edit_employee', label: 'Edit Employee' },
      { id: 'delete_employee', label: 'Delete Employee' },
    ],
  },
  {
    id: 'view_transactions',
    label: 'View Transactions',
    children: [{ id: 'export_transactions_pdf', label: 'Export PDF' }],
  },
  { id: 'view_reports', label: 'View Reports' },
]

interface AdminPrivilegesProps {
  selectedPermissions: string[]
  onChange: (permissions: string[]) => void
}

export function AdminPrivileges({ selectedPermissions, onChange }: AdminPrivilegesProps) {
  const togglePermission = (id: string, checked: boolean) => {
    let newPermissions = [...selectedPermissions]

    if (checked) {
      if (!newPermissions.includes(id)) newPermissions.push(id)
    } else {
      newPermissions = newPermissions.filter((p) => p !== id)

      // Nested uncheck logic
      const parentPrivilege = PRIVILEGES.find((p) => p.id === id)
      if (parentPrivilege && parentPrivilege.children) {
        // Uncheck all children
        const childIds = parentPrivilege.children.map((c) => c.id)
        newPermissions = newPermissions.filter((p) => !childIds.includes(p))
      }
    }

    // Auto-check parent if child is checked (optional, but good UX)
    if (checked) {
      const parent = PRIVILEGES.find((p) =>
        p.children?.some((c) => c.id === id)
      )
      if (parent && !newPermissions.includes(parent.id)) {
        newPermissions.push(parent.id)
      }
    }

    onChange(newPermissions)
  }

  return (
    <div className="grid gap-3 pt-4 border-t border-border">
      <h3 className="font-semibold text-sm">Admin Privileges</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {PRIVILEGES.map((privilege) => (
          <div key={privilege.id} className="space-y-2 rounded-lg border border-border/50 p-3 bg-muted/20">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={privilege.id}
                checked={selectedPermissions.includes(privilege.id)}
                onCheckedChange={(checked) => togglePermission(privilege.id, checked as boolean)}
              />
              <Label htmlFor={privilege.id} className="font-medium">
                {privilege.label}
              </Label>
            </div>
            {privilege.children && (
              <div className="ml-6 grid grid-cols-1 gap-2 pt-1">
                {privilege.children.map((child) => (
                  <div key={child.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={child.id}
                      checked={selectedPermissions.includes(child.id)}
                      onCheckedChange={(checked) => togglePermission(child.id, checked as boolean)}
                    />
                    <Label htmlFor={child.id} className="text-sm font-normal text-muted-foreground">
                      {child.label}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
