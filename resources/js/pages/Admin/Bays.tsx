import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import axios from 'axios';
import { Edit2, Trash2 } from 'lucide-react';

axios.defaults.withCredentials = true;

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Bays', href: '/bays' },
];

interface Bay {
    bay_id: number;
    bay_number: number;
    status: 'available' | 'occupied' | 'maintenance';
    bay_type: 'Normal' | 'Underwash';
    created_at?: string;
    updated_at?: string;
}

export default function Bays() {
    const [bays, setBays] = useState<Bay[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Form state for add
    const [addForm, setAddForm] = useState({
        bay_number: '',
        bay_type: 'Normal',
    });

    // Form state for edit
    const [editForm, setEditForm] = useState<Bay | null>(null);
    const [editBayForm, setEditBayForm] = useState({
        bay_number: '',
        bay_type: 'Normal' as 'Normal' | 'Underwash',
        status: 'available' as 'available' | 'occupied' | 'maintenance',
    });

    // Delete confirmation state
    const [bayToDelete, setBayToDelete] = useState<Bay | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [addErrors, setAddErrors] = useState<Record<string, string>>({});
    const [editErrors, setEditErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        loadBays();
    }, []);

    const loadBays = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/bays');
            setBays(res.data);
        } catch (err) {
            console.error('Failed to fetch bays:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddBay = async () => {
        const errors: Record<string, string> = {};

        if (!addForm.bay_number) {
            errors.bay_number = 'Bay number is required';
        }
        if (!addForm.bay_type) {
            errors.bay_type = 'Bay type is required';
        }

        setAddErrors(errors);
        if (Object.keys(errors).length > 0) return;

        try {
            setSubmitting(true);
            await axios.post('/bays', {
                bay_number: parseInt(addForm.bay_number),
                bay_type: addForm.bay_type,
                status: 'available',
            });

            setShowAddModal(false);
            setAddForm({ bay_number: '', bay_type: 'Normal' });
            setAddErrors({});
            await loadBays();
        } catch (err) {
            const error = err as unknown as { response?: { data?: { errors: Record<string, string> } } };
            if (error.response?.data?.errors) {
                setAddErrors(error.response.data.errors);
            } else {
                setAddErrors({ submit: 'Failed to add bay' });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const openEditModal = (bay: Bay) => {
        setEditForm(bay);
        setEditBayForm({
            bay_number: bay.bay_number.toString(),
            bay_type: bay.bay_type,
            status: bay.status,
        });
        setEditErrors({});
        setShowEditModal(true);
    };

    const handleEditBay = async () => {
        if (!editForm) return;

        const errors: Record<string, string> = {};

        if (!editBayForm.bay_number) {
            errors.bay_number = 'Bay number is required';
        }
        if (!editBayForm.bay_type) {
            errors.bay_type = 'Bay type is required';
        }
        if (!editBayForm.status) {
            errors.status = 'Status is required';
        }

        setEditErrors(errors);
        if (Object.keys(errors).length > 0) return;

        try {
            setSubmitting(true);
            await axios.put(`/bays/${editForm.bay_id}`, {
                bay_number: parseInt(editBayForm.bay_number),
                bay_type: editBayForm.bay_type,
                status: editBayForm.status,
            });

            setShowEditModal(false);
            setEditForm(null);
            setEditErrors({});
            await loadBays();
        } catch (err) {
            const error = err as unknown as { response?: { data?: { errors: Record<string, string> } } };
            if (error.response?.data?.errors) {
                setEditErrors(error.response.data.errors);
            } else {
                setEditErrors({ submit: 'Failed to update bay' });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteClick = (bay: Bay) => {
        setBayToDelete(bay);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!bayToDelete) return;

        try {
            setSubmitting(true);
            await axios.delete(`/bays/${bayToDelete.bay_id}`);
            setShowDeleteModal(false);
            setBayToDelete(null);
            await loadBays();
        } catch (err) {
            console.error('Failed to delete bay:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'available':
                return 'default';
            case 'occupied':
                return 'secondary';
            case 'maintenance':
                return 'destructive';
            default:
                return 'default';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bays" />
            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Bay Management"
                        description="Manage carwash bays and their availability"
                    />
                    <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                        <DialogTrigger asChild>
                            <Button variant="highlight">+ Add Bay</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>
                                    Add New <span className="text-highlight font-semibold">Bay</span>
                                </DialogTitle>
                            </DialogHeader>

                            <div className="grid gap-4 py-4">
                                {/* Bay Number */}
                                <div className="grid gap-2">
                                    <Label htmlFor="bay_number">Bay Number</Label>
                                    <Input
                                        id="bay_number"
                                        type="number"
                                        placeholder="e.g., 1"
                                        value={addForm.bay_number}
                                        onChange={(e) =>
                                            setAddForm({
                                                ...addForm,
                                                bay_number: e.target.value,
                                            })
                                        }
                                    />
                                    {addErrors.bay_number && (
                                        <p className="text-sm text-red-500">
                                            {addErrors.bay_number}
                                        </p>
                                    )}
                                </div>

                                {/* Bay Type */}
                                <div className="grid gap-2">
                                    <Label htmlFor="bay_type">Bay Type</Label>
                                    <Select
                                        value={addForm.bay_type}
                                        onValueChange={(value) =>
                                            setAddForm({
                                                ...addForm,
                                                bay_type: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Normal">
                                                Normal
                                            </SelectItem>
                                            <SelectItem value="Underwash">
                                                Underwash
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {addErrors.bay_type && (
                                        <p className="text-sm text-red-500">
                                            {addErrors.bay_type}
                                        </p>
                                    )}
                                </div>

                                {addErrors.submit && (
                                    <p className="text-sm text-red-500">
                                        {addErrors.submit}
                                    </p>
                                )}
                            </div>

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="secondary">
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button
                                    variant="highlight"
                                    onClick={handleAddBay}
                                    disabled={submitting}
                                >
                                    {submitting ? 'Adding...' : 'Add Bay'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Bays Grid */}
                {loading ? (
                    <div className="py-12 text-center text-muted-foreground">
                        Loading bays...
                    </div>
                ) : bays.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                        No bays found. Click "Add Bay" to create one.
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {bays.map((bay) => (
                            <Card
                                key={bay.bay_id}
                                className="border border-border/60 bg-card"
                            >
                                <CardContent className="p-5">
                                    <div className="mb-4 flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold">
                                                Bay #{bay.bay_number}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {bay.bay_type} Bay
                                            </p>
                                        </div>
                                        <Badge
                                            variant={getStatusVariant(
                                                bay.status,
                                            )}
                                            className="capitalize"
                                        >
                                            {bay.status}
                                        </Badge>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEditModal(bay)}
                                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm hover:bg-accent"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDeleteClick(bay)
                                            }
                                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 hover:bg-red-100 dark:border-red-800 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Delete
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Edit Modal */}
                <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                Edit <span className="text-highlight font-semibold">Bay</span>
                            </DialogTitle>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            {/* Bay Number */}
                            <div className="grid gap-2">
                                <Label htmlFor="edit_bay_number">
                                    Bay Number
                                </Label>
                                <Input
                                    id="edit_bay_number"
                                    type="number"
                                    placeholder="e.g., 1"
                                    value={editBayForm.bay_number}
                                    onChange={(e) =>
                                        setEditBayForm({
                                            ...editBayForm,
                                            bay_number: e.target.value,
                                        })
                                    }
                                />
                                {editErrors.bay_number && (
                                    <p className="text-sm text-red-500">
                                        {editErrors.bay_number}
                                    </p>
                                )}
                            </div>

                            {/* Bay Type */}
                            <div className="grid gap-2">
                                <Label htmlFor="edit_bay_type">Bay Type</Label>
                                <Select
                                    value={editBayForm.bay_type}
                                    onValueChange={(value) =>
                                        setEditBayForm({
                                            ...editBayForm,
                                            bay_type: value as
                                                | 'Normal'
                                                | 'Underwash',
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Normal">
                                            Normal
                                        </SelectItem>
                                        <SelectItem value="Underwash">
                                            Underwash
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {editErrors.bay_type && (
                                    <p className="text-sm text-red-500">
                                        {editErrors.bay_type}
                                    </p>
                                )}
                            </div>

                            {/* Status */}
                            <div className="grid gap-2">
                                <Label htmlFor="edit_status">Status</Label>
                                <Select
                                    value={editBayForm.status}
                                    onValueChange={(value) =>
                                        setEditBayForm({
                                            ...editBayForm,
                                            status: value as
                                                | 'available'
                                                | 'occupied'
                                                | 'maintenance',
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="available">
                                            Available
                                        </SelectItem>
                                        <SelectItem value="occupied">
                                            Occupied
                                        </SelectItem>
                                        <SelectItem value="maintenance">
                                            Maintenance
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {editErrors.status && (
                                    <p className="text-sm text-red-500">
                                        {editErrors.status}
                                    </p>
                                )}
                            </div>

                            {editErrors.submit && (
                                <p className="text-sm text-red-500">
                                    {editErrors.submit}
                                </p>
                            )}
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="secondary">Cancel</Button>
                            </DialogClose>
                            <Button
                                variant="highlight"
                                onClick={handleEditBay}
                                disabled={submitting}
                            >
                                {submitting ? 'Updating...' : 'Update Bay'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Modal */}
                <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                    <DialogContent className="sm:max-w-sm">
                        <DialogHeader>
                            <DialogTitle>Delete Bay</DialogTitle>
                        </DialogHeader>
                        <p className="text-center text-muted-foreground">
                            Are you sure you want to delete{' '}
                            <span className="font-semibold">
                                Bay #{bayToDelete?.bay_number}
                            </span>
                            ? This action cannot be undone.
                        </p>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="secondary">Cancel</Button>
                            </DialogClose>
                            <Button
                                variant="destructive"
                                onClick={handleConfirmDelete}
                                disabled={submitting}
                            >
                                {submitting ? 'Deleting...' : 'Delete'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
