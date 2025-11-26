import Heading from '@/components/heading';
import HeadingSmall from '@/components/heading-small';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

// ---------- Interfaces ----------
interface BreadcrumbItem {
    title: string;
    href: string;
}

interface Staff {
    id: number;
    firstName: string;
    lastName: string;
    middleName?: string;
    phone: string;
    address: string;
    status: 'Active' | 'Inactive' | 'Absent';
    dateHired: string;
    role: 'Admin' | 'Employee';
}

// ---------- Breadcrumbs ----------
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Staff Management', href: '/staffs' },
];

export default function Staffs() {
    const pageProps = usePage().props as unknown as { staffs?: Staff[] };

    const initialStaffs = (pageProps.staffs ?? []).map((s) => ({
        ...s,
        middleName: s.middleName ?? '',
        role: s.role ?? 'Employee',
    }));

    const [staffList, setStaffList] = useState<Staff[]>(initialStaffs);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<
        'All' | 'Active' | 'Inactive' | 'Absent'
    >('All');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState<Staff[]>([]);
    const searchRef = useRef<HTMLDivElement>(null);

    // Add / Edit Form state
    const [addForm, setAddForm] = useState({
        firstName: '',
        lastName: '',
        middleName: '',
        phone: '',
        address: '',
    });
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [editForm, setEditForm] = useState({
        firstName: '',
        lastName: '',
        middleName: '',
        phone: '',
        address: '',
        status: 'Active' as Staff['status'],
    });

    // Delete modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingStaffId, setDeletingStaffId] = useState<number | null>(null);

    // Sync with server props
    useEffect(() => setStaffList(initialStaffs), [pageProps.staffs]);

    // Suggestions
    useEffect(() => {
        if (search.length > 0) {
            const matches = staffList.filter((s) => {
                const fullName =
                    `${s.firstName} ${s.middleName ?? ''} ${s.lastName}`.toLowerCase();
                return fullName.includes(search.toLowerCase());
            });
            setSuggestions(matches.slice(0, 5));
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [search, staffList]);

    const formatPhone = (value: string) =>
        value.replace(/\D/g, '').slice(0, 11);

    const resetAddForm = () =>
        setAddForm({
            firstName: '',
            lastName: '',
            middleName: '',
            phone: '',
            address: '',
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

    const handleSuggestionClick = (staff: Staff) => {
        setSearch(
            `${staff.firstName} ${staff.middleName ?? ''} ${staff.lastName}`,
        );
        setShowSuggestions(false);
    };

    // ---------- CRUD Handlers ----------
    const handleAdd = async () => {
        if (!addForm.firstName || !addForm.lastName || !addForm.phone) return;

        try {
            await axios.post('/api/staffs', addForm); // still send to backend

            // create a staff object locally to update the UI immediately
            const newStaff: Staff = {
                id: Date.now(), // temporary ID
                firstName: addForm.firstName,
                lastName: addForm.lastName,
                middleName: addForm.middleName,
                phone: addForm.phone,
                address: addForm.address,
                status: 'Active',
                dateHired: new Date().toISOString().split('T')[0],
                role: 'Employee',
            };

            setStaffList((prev) => [...prev, newStaff]);
            resetAddForm();
        } catch (error) {
            console.error(error);
        }
    };

    const openEdit = (staff: Staff) => {
        setEditingStaff(staff);
        setEditForm({ ...staff });
    };

    const handleUpdate = async () => {
        if (!editingStaff) return;
        try {
            await axios.put(`/staffs/${editingStaff.id}`, editForm);
            setStaffList((prev) =>
                prev.map((s) =>
                    s.id === editingStaff.id ? { ...s, ...editForm } : s,
                ),
            );
            resetEditForm();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = (id: number) => {
        setDeletingStaffId(id);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!deletingStaffId) return;
        try {
            await axios.delete(`/staffs/${deletingStaffId}`);
            setStaffList((prev) =>
                prev.filter((s) => s.id !== deletingStaffId),
            );
        } catch (error) {
            console.error(error);
        } finally {
            setShowDeleteModal(false);
            setDeletingStaffId(null);
        }
    };

    // ---------- Filtering ----------
    const filteredStaff = useMemo(() => {
        return staffList.filter((s) => {
            const fullName =
                `${s.firstName} ${s.middleName ?? ''} ${s.lastName}`.toLowerCase();
            const matchesSearch =
                fullName.includes(search.toLowerCase()) ||
                s.phone.includes(search);
            const matchesFilter = filter === 'All' || s.status === filter;
            return matchesSearch && matchesFilter;
        });
    }, [staffList, search, filter]);

    const getStatusVariant = (status: Staff['status']) => {
        switch (status) {
            case 'Active':
                return 'success';
            case 'Inactive':
                return 'destructive';
            case 'Absent':
                return 'warning';
        }
    };

    const staffToDelete = deletingStaffId
        ? staffList.find((s) => s.id === deletingStaffId)
        : null;

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
                                        variant="highlight"
                                        onClick={handleAdd}
                                    >
                                        Add Employee
                                    </Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/*search*/}
                <Card className="border border-border/70 bg-background">
                    <CardContent className="p-4 text-foreground">
                        <div ref={searchRef} className="relative w-full">
                            <Label className="mb-1 block text-sm">
                                Search Employees
                            </Label>
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                                <Input
                                    placeholder="Search by name or phone..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onFocus={() =>
                                        search.length > 0 &&
                                        setShowSuggestions(true)
                                    }
                                    onBlur={() =>
                                        setTimeout(
                                            () => setShowSuggestions(false),
                                            150,
                                        )
                                    }
                                    className="pl-10"
                                />
                                {/* Suggestions Dropdown */}
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="custom-scrollbar absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-background shadow-lg">
                                        {suggestions.map((staff) => {
                                            const fullName = `${staff.firstName} ${staff.middleName ?? ''} ${staff.lastName}`;
                                            return (
                                                <div
                                                    key={staff.id}
                                                    className="cursor-pointer border-b border-border/50 p-3 last:border-b-0 hover:bg-accent/50"
                                                    onClick={() =>
                                                        handleSuggestionClick(
                                                            staff,
                                                        )
                                                    }
                                                >
                                                    <div className="font-medium text-foreground">
                                                        {fullName}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {staff.phone}
                                                    </div>
                                                </div>
                                            );
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
                                description={`Total: ${filteredStaff.length} employee${
                                    filteredStaff.length !== 1 ? 's' : ''
                                }`}
                            />

                            <Select
                                value={filter}
                                onValueChange={(value) =>
                                    setFilter(value as typeof filter)
                                }
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter by: All" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All</SelectItem>
                                    <SelectItem value="Active">
                                        Active
                                    </SelectItem>
                                    <SelectItem value="Inactive">
                                        Inactive
                                    </SelectItem>
                                    <SelectItem value="Absent">
                                        Absent
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {filteredStaff.length === 0 ? (
                            <div className="py-12 text-center">
                                <p className="italic">
                                    {search || filter !== 'All'
                                        ? 'No employees match your search.'
                                        : 'No employees yet. Click "Add Employee" to get started.'}
                                </p>
                            </div>
                        ) : (
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
                                            <TableHead className="text-center">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredStaff.map((staff) => {
                                            const middleInitial =
                                                staff.middleName?.trim()
                                                    ? `${staff.middleName.trim()[0]}.`
                                                    : '';
                                            return (
                                                <TableRow key={staff.id}>
                                                    <TableCell className="font-medium">
                                                        {staff.firstName}{' '}
                                                        {middleInitial
                                                            ? `${middleInitial} `
                                                            : ''}
                                                        {staff.lastName}
                                                    </TableCell>
                                                    <TableCell>
                                                        {staff.phone}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={getStatusVariant(
                                                                staff.status,
                                                            )}
                                                        >
                                                            {staff.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {staff.dateHired}
                                                    </TableCell>
                                                    <TableCell>
                                                        {staff.address}
                                                    </TableCell>
                                                    <TableCell className="font-bold">
                                                        {staff.role}
                                                    </TableCell>
                                                    <TableCell>
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
                                                                            <Select
                                                                                value={
                                                                                    editForm.status
                                                                                }
                                                                                onValueChange={(
                                                                                    value,
                                                                                ) =>
                                                                                    setEditForm(
                                                                                        {
                                                                                            ...editForm,
                                                                                            status: value as typeof editForm.status,
                                                                                        },
                                                                                    )
                                                                                }
                                                                            >
                                                                                <SelectTrigger className="w-full">
                                                                                    <SelectValue placeholder="Select status" />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    <SelectItem value="Active">
                                                                                        Active
                                                                                    </SelectItem>
                                                                                    <SelectItem value="Inactive">
                                                                                        Inactive
                                                                                    </SelectItem>
                                                                                    <SelectItem value="Absent">
                                                                                        Absent
                                                                                    </SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
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
                                                                                variant="highlight"
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
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {/* Delete Confirmation Modal */}
                        <Dialog
                            open={showDeleteModal}
                            onOpenChange={setShowDeleteModal}
                        >
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Delete{' '}
                                        <span className="text-highlight">
                                            Employee
                                        </span>
                                    </DialogTitle>
                                    <DialogDescription>
                                        Are you sure you want to delete{' '}
                                        <span className="font-semibold">
                                            {staffToDelete?.firstName}{' '}
                                            {staffToDelete?.lastName}
                                        </span>
                                        ? This action cannot be undone.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button
                                            variant="secondary"
                                            onClick={() => {
                                                setShowDeleteModal(false);
                                                setDeletingStaffId(null);
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
    );
}
