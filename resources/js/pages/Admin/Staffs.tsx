import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Staff Management', href: '/staffs' },
];

interface Staff {
    id: number;
    firstName: string;
    lastName: string;
    middleName: string;
    phone: string;
    address: string;
    status: 'Active' | 'Inactive' | 'Absent';
    dateHired: string;
    role: 'Admin' | 'Employee';
}

export default function Staffs({ staffs = [] }: { staffs?: Staff[] }) {
    const [staffList, setStaffList] = useState<Staff[]>(staffs);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<
        'All' | 'Active' | 'Inactive' | 'Absent'
    >('All');

    /*add modal*/
    const [addForm, setAddForm] = useState({
        firstName: '',
        lastName: '',
        middleName: '',
        phone: '',
        address: '',
    });

    const resetAddForm = () =>
        setAddForm({
            firstName: '',
            lastName: '',
            middleName: '',
            phone: '',
            address: '',
        });

    /*edit modal*/
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [editForm, setEditForm] = useState({
        firstName: '',
        lastName: '',
        middleName: '',
        phone: '',
        address: '',
        status: 'Active' as 'Active' | 'Inactive' | 'Absent',
    });

    const resetEditForm = () => {
        setEditingStaff(null);
        setEditForm({
            firstName: '',
            lastName: '',
            middleName: '',
            phone: '',
            address: '',
            status: 'Active',
        });
    };

    /*format*/
    const formatPhone = (value: string) =>
        value.replace(/\D/g, '').slice(0, 11);

    /*handler*/
    const handleAdd = () => {
        if (
            !addForm.firstName.trim() ||
            !addForm.lastName.trim() ||
            !addForm.phone.trim()
        )
            return;

        const newStaff: Staff = {
            id: Date.now(),
            firstName: addForm.firstName,
            lastName: addForm.lastName,
            middleName: addForm.middleName,
            phone: addForm.phone,
            address: addForm.address,
            status: 'Active',
            dateHired: new Date().toLocaleDateString('en-US'),
            role: 'Employee',
        };
        setStaffList((prev) => [...prev, newStaff]);
        resetAddForm();
    };

    const openEdit = (staff: Staff) => {
        setEditingStaff(staff);
        setEditForm({
            firstName: staff.firstName,
            lastName: staff.lastName,
            middleName: staff.middleName,
            phone: staff.phone,
            address: staff.address,
            status: staff.status,
        });
    };

    const handleUpdate = () => {
        if (!editingStaff) return;
        setStaffList((prev) =>
            prev.map((s) =>
                s.id === editingStaff.id
                    ? {
                          ...s,
                          firstName: editForm.firstName,
                          lastName: editForm.lastName,
                          middleName: editForm.middleName,
                          phone: editForm.phone,
                          address: editForm.address,
                          status: editForm.status,
                      }
                    : s,
            ),
        );
        resetEditForm();
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this employee?')) {
            setStaffList((prev) => prev.filter((s) => s.id !== id));
        }
    };

    const filteredStaff = useMemo(() => {
        return staffList.filter((s) => {
            const fullName =
                `${s.firstName} ${s.middleName} ${s.lastName}`.toLowerCase();
            const term = search.toLowerCase();
            const matchesSearch =
                fullName.includes(term) || s.phone.includes(term);
            const matchesFilter = filter === 'All' || s.status === filter;
            return matchesSearch && matchesFilter;
        });
    }, [staffList, search, filter]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Staff Management" />
            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                        Staff Management
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400">
                        Manage employees and schedules
                    </p>
                </div>

                {/*search n add*/}
                <Card className="border border-sidebar-border/70 bg-white dark:bg-neutral-900">
                    <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-end md:justify-between">
                        {/*search*/}
                        <div className="relative w-full md:w-2/3">
                            <Label className="mb-1 block text-sm text-neutral-600 dark:text-neutral-300">
                                Search Employees
                            </Label>
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                                <Input
                                    placeholder="Search by name or phone..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="border-neutral-300 bg-white pl-10 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                                />
                            </div>
                        </div>

                        {/*add modal*/}
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="flex items-center gap-2 bg-yellow-400 font-medium text-black hover:bg-yellow-500">
                                    <Plus className="h-4 w-4" /> Add Employee
                                </Button>
                            </DialogTrigger>

                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>
                                        Add{' '}
                                        <span className="font-semibold text-yellow-500">
                                            Employee
                                        </span>
                                    </DialogTitle>
                                </DialogHeader>

                                <div className="grid gap-3 py-2">
                                    {/*first name*/}
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
                                            placeholder="First name"
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
                                            placeholder="Last name"
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
                                            placeholder="Middle name"
                                        />
                                    </div>

                                    {/*phone*/}
                                    <div>
                                        <Label>Phone Number</Label>
                                        <Input
                                            value={addForm.phone}
                                            onChange={(e) => {
                                                const formatted = formatPhone(
                                                    e.target.value,
                                                );
                                                setAddForm({
                                                    ...addForm,
                                                    phone: formatted,
                                                });
                                            }}
                                            placeholder="09123456789"
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
                                            placeholder="Address"
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
                                            className="bg-yellow-400 text-black hover:bg-yellow-500"
                                            onClick={handleAdd}
                                        >
                                            Add Employee
                                        </Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>

                {/*staff_tbl*/}
                <Card className="border border-sidebar-border/70 bg-white dark:bg-neutral-900">
                    <CardContent className="p-4">
                        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="font-semibold text-neutral-800 dark:text-white">
                                    Staff List
                                </h2>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    Total: {filteredStaff.length} employee
                                    {filteredStaff.length !== 1 ? 's' : ''}
                                </p>
                            </div>

                            <select
                                className="rounded-md border border-neutral-300 bg-white p-2 text-sm text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                                value={filter}
                                onChange={(e) =>
                                    setFilter(e.target.value as typeof filter)
                                }
                            >
                                <option value="All">Filter by: All</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Absent">Absent</option>
                            </select>
                        </div>

                        {filteredStaff.length === 0 ? (
                            <div className="py-12 text-center text-neutral-500 dark:text-neutral-400">
                                <p className="italic">
                                    {search || filter !== 'All'
                                        ? 'No employees match your search.'
                                        : 'No employees yet. Click "Add Employee" to get started.'}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b border-neutral-200 dark:border-neutral-700">
                                        <tr className="font-bold text-neutral-700 dark:text-neutral-300">
                                            <th className="pb-3">Name</th>
                                            <th className="pb-3">Contact #</th>
                                            <th className="pb-3">Status</th>
                                            <th className="pb-3">Date Hired</th>
                                            <th className="pb-3">Address</th>
                                            <th className="pb-3">Role</th>
                                            <th className="pb-3 text-center">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStaff.map((staff) => (
                                            <tr
                                                key={staff.id}
                                                className="border-t border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                                            >
                                                <td className="py-3 font-medium text-neutral-900 dark:text-neutral-100">
                                                    {staff.firstName}{' '}
                                                    {staff.middleName &&
                                                        `${staff.middleName} `}{' '}
                                                    {staff.lastName}
                                                </td>
                                                <td className="py-3 text-neutral-800 dark:text-neutral-200">
                                                    {staff.phone}
                                                </td>
                                                <td className="py-3">
                                                    <span
                                                        className={cn(
                                                            'inline-block rounded-full px-3 py-1 text-xs font-bold',
                                                            staff.status ===
                                                                'Active' &&
                                                                'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                                                            staff.status ===
                                                                'Inactive' &&
                                                                'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
                                                            staff.status ===
                                                                'Absent' &&
                                                                'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                                                        )}
                                                    >
                                                        {staff.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-neutral-800 dark:text-neutral-200">
                                                    {staff.dateHired}
                                                </td>
                                                <td className="py-3 text-neutral-800 dark:text-neutral-200">
                                                    {staff.address}
                                                </td>
                                                <td className="py-3 font-bold text-neutral-800 dark:text-neutral-200">
                                                    {staff.role}
                                                </td>
                                                <td className="py-3">
                                                    <div className="flex justify-center gap-3">
                                                        {/* edit modal */}
                                                        <Dialog>
                                                            <DialogTrigger
                                                                asChild
                                                            >
                                                                <button
                                                                    onClick={() =>
                                                                        openEdit(
                                                                            staff,
                                                                        )
                                                                    }
                                                                    className="text-neutral-600 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400"
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </button>
                                                            </DialogTrigger>

                                                            <DialogContent className="sm:max-w-md">
                                                                <DialogHeader>
                                                                    <DialogTitle>
                                                                        Edit{' '}
                                                                        <span className="font-semibold text-yellow-500">
                                                                            Employee
                                                                        </span>
                                                                    </DialogTitle>
                                                                </DialogHeader>

                                                                <div className="grid gap-3 py-2">
                                                                    {/* first name */}
                                                                    <div>
                                                                        <Label>
                                                                            First
                                                                            Name
                                                                        </Label>
                                                                        <Input
                                                                            value={
                                                                                editForm.firstName
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                setEditForm(
                                                                                    {
                                                                                        ...editForm,
                                                                                        firstName:
                                                                                            e
                                                                                                .target
                                                                                                .value,
                                                                                    },
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>

                                                                    {/*last name*/}
                                                                    <div>
                                                                        <Label>
                                                                            Last
                                                                            Name
                                                                        </Label>
                                                                        <Input
                                                                            value={
                                                                                editForm.lastName
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                setEditForm(
                                                                                    {
                                                                                        ...editForm,
                                                                                        lastName:
                                                                                            e
                                                                                                .target
                                                                                                .value,
                                                                                    },
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>

                                                                    {/*middle name*/}
                                                                    <div>
                                                                        <Label>
                                                                            Middle
                                                                            Name
                                                                            (optional)
                                                                        </Label>
                                                                        <Input
                                                                            value={
                                                                                editForm.middleName
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                setEditForm(
                                                                                    {
                                                                                        ...editForm,
                                                                                        middleName:
                                                                                            e
                                                                                                .target
                                                                                                .value,
                                                                                    },
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>

                                                                    {/*phone*/}
                                                                    <div>
                                                                        <Label>
                                                                            Phone
                                                                            Number
                                                                        </Label>
                                                                        <Input
                                                                            value={
                                                                                editForm.phone
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) => {
                                                                                const formatted =
                                                                                    formatPhone(
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                    );
                                                                                setEditForm(
                                                                                    {
                                                                                        ...editForm,
                                                                                        phone: formatted,
                                                                                    },
                                                                                );
                                                                            }}
                                                                            maxLength={
                                                                                11
                                                                            }
                                                                        />
                                                                    </div>

                                                                    {/*address*/}
                                                                    <div>
                                                                        <Label>
                                                                            Address
                                                                        </Label>
                                                                        <Input
                                                                            value={
                                                                                editForm.address
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                setEditForm(
                                                                                    {
                                                                                        ...editForm,
                                                                                        address:
                                                                                            e
                                                                                                .target
                                                                                                .value,
                                                                                    },
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>

                                                                    {/*status*/}
                                                                    <div>
                                                                        <Label>
                                                                            Status
                                                                        </Label>
                                                                        <select
                                                                            value={
                                                                                editForm.status
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                setEditForm(
                                                                                    {
                                                                                        ...editForm,
                                                                                        status: e
                                                                                            .target
                                                                                            .value as typeof editForm.status,
                                                                                    },
                                                                                )
                                                                            }
                                                                            className="w-full rounded-md border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                                                                        >
                                                                            <option value="Active">
                                                                                Active
                                                                            </option>
                                                                            <option value="Inactive">
                                                                                Inactive
                                                                            </option>
                                                                            <option value="Absent">
                                                                                Absent
                                                                            </option>
                                                                        </select>
                                                                    </div>
                                                                </div>

                                                                <DialogFooter className="flex justify-end gap-3">
                                                                    <DialogClose
                                                                        asChild
                                                                    >
                                                                        <Button
                                                                            variant="secondary"
                                                                            onClick={
                                                                                resetEditForm
                                                                            }
                                                                        >
                                                                            Cancel
                                                                        </Button>
                                                                    </DialogClose>
                                                                    <DialogClose
                                                                        asChild
                                                                    >
                                                                        <Button
                                                                            className="bg-yellow-400 text-black hover:bg-yellow-500"
                                                                            onClick={
                                                                                handleUpdate
                                                                            }
                                                                        >
                                                                            Update
                                                                            Employee
                                                                        </Button>
                                                                    </DialogClose>
                                                                </DialogFooter>
                                                            </DialogContent>
                                                        </Dialog>

                                                        {/*delete*/}
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    staff.id,
                                                                )
                                                            }
                                                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
