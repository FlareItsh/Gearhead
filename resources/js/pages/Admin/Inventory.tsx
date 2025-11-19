import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { ChevronDownIcon, Edit2, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inventory', href: '/inventory' },
];

interface Supply {
    supply_id: number;
    supply_name: string;
    unit: string;
    quantity_stock: number;
    reorder_point: number;
    supply_type: 'consumables' | 'supply';
}

export default function InventoryPage() {
    const [allSupplies, setAllSupplies] = useState<Supply[]>([]);
    const [searchValue, setSearchValue] = useState('');
    const [filter, setFilter] = useState<'All' | 'supply' | 'consumables'>(
        'All',
    );

    const [showAddItem, setShowAddItem] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [onConfirmAction, setOnConfirmAction] = useState<() => void>(
        () => {},
    );

    const [newItem, setNewItem] = useState({
        supply_name: '',
        unit: '',
        reorder_point: 0,
        quantity_stock: 0,
        supply_type: 'supply' as const,
    });

    const [editItem, setEditItem] = useState<Supply | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        loadSupplies();
    }, []);

    const loadSupplies = async () => {
        try {
            const res = await axios.get('/supplies');
            setAllSupplies(res.data);
        } catch (err) {
            console.error('Failed to fetch supplies:', err);
        }
    };

    const handleAddItem = () => {
        if (!newItem.supply_name || !newItem.unit) return;

        setConfirmMessage(
            `Are you sure you want to add "${newItem.supply_name}" to inventory?`,
        );
        setOnConfirmAction(() => async () => {
            try {
                const res = await axios.post('/supplies', newItem);
                setAllSupplies((prev) => [...prev, res.data]);
                setFilter('All');
                setSearchValue('');
                setShowAddItem(false);
                setNewItem({
                    supply_name: '',
                    unit: '',
                    reorder_point: 0,
                    quantity_stock: 0,
                    supply_type: 'supply',
                });
            } catch (err) {
                console.error('Failed to create supply:', err);
            }
        });
        setConfirmOpen(true);
    };

    const handleCancelAddItem = () => {
        if (
            !newItem.supply_name &&
            !newItem.unit &&
            newItem.reorder_point === 0
        ) {
            setShowAddItem(false);
        } else {
            setConfirmMessage(
                'Are you sure you want to cancel? Your input will be lost.',
            );
            setOnConfirmAction(() => () => setShowAddItem(false));
            setConfirmOpen(true);
        }
    };

    const handleConfirm = async () => {
        await onConfirmAction();
        setConfirmOpen(false);
    };

    const handleSaveEdit = async () => {
        if (!editItem) return;

        try {
            const res = await axios.put(
                `/supplies/${editItem.supply_id}`,
                editItem,
            );
            setAllSupplies((prev) =>
                prev.map((s) =>
                    s.supply_id === editItem.supply_id ? res.data : s,
                ),
            );
            setFilter('All');
            setSearchValue('');
            setShowEditModal(false);
            setEditItem(null);
        } catch (err) {
            console.error('Failed to update supply:', err);
        }
    };

    // Filtering logic
    const filteredSupplies = useMemo(() => {
        if (!allSupplies.length) return [];

        const term = searchValue.toLowerCase().trim();

        return allSupplies.filter((s) => {
            const name = (s.supply_name || '').toLowerCase();

            if (filter !== 'All' && s.supply_type !== filter) {
                return false;
            }

            return name.includes(term);
        });
    }, [allSupplies, searchValue, filter]);

    const getStatusInfo = (
        supply: Supply,
    ): { status: string; variant: 'success' | 'warning' | 'destructive' } => {
        const quantity = Number(supply.quantity_stock);
        const reorderPoint = Number(supply.reorder_point);

        if (quantity === 0) {
            return { status: 'No Stock', variant: 'destructive' };
        }
        if (quantity <= reorderPoint) {
            return { status: 'Low Stock', variant: 'warning' };
        }
        return { status: 'In Stock', variant: 'success' };
    };

    const openEditModal = (supply: Supply) => {
        setEditItem({ ...supply });
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setTimeout(() => setEditItem(null), 300);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Inventory"
                        description="Track supplies and materials"
                    />
                    <div className="flex space-x-2">
                        <Dialog
                            open={showAddItem}
                            onOpenChange={setShowAddItem}
                        >
                            <DialogTrigger asChild>
                                <Button variant="highlight">+ Add Item</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>
                                        Add{' '}
                                        <span className="font-bold text-highlight">
                                            Item
                                        </span>
                                    </DialogTitle>
                                    <DialogDescription>
                                        Record a new inventory item.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="flex flex-col gap-3">
                                    <div>
                                        <label className="text-sm font-medium">
                                            Item Name
                                        </label>
                                        <Input
                                            placeholder="Item Name"
                                            value={newItem.supply_name}
                                            onChange={(e) =>
                                                setNewItem({
                                                    ...newItem,
                                                    supply_name: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">
                                            Unit
                                        </label>
                                        <Input
                                            placeholder="Unit"
                                            value={newItem.unit}
                                            onChange={(e) =>
                                                setNewItem({
                                                    ...newItem,
                                                    unit: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">
                                            Reorder Level
                                        </label>
                                        <Input
                                            type="number"
                                            placeholder="Reorder Level"
                                            value={newItem.reorder_point}
                                            onChange={(e) =>
                                                setNewItem({
                                                    ...newItem,
                                                    reorder_point:
                                                        parseInt(
                                                            e.target.value,
                                                        ) || 0,
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        variant="secondary"
                                        onClick={handleCancelAddItem}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="highlight"
                                        onClick={handleAddItem}
                                    >
                                        Save
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* Confirmation Dialog (still used for add/cancel) */}
                        <Dialog
                            open={confirmOpen}
                            onOpenChange={setConfirmOpen}
                        >
                            <DialogContent className="w-full rounded-xl p-6 shadow-lg sm:max-w-sm">
                                <DialogHeader>
                                    <DialogTitle>Confirm Action</DialogTitle>
                                </DialogHeader>
                                <p className="my-4 text-center text-gray-600">
                                    {confirmMessage}
                                </p>
                                <DialogFooter className="flex justify-end gap-3">
                                    <Button
                                        variant="secondary"
                                        onClick={() => setConfirmOpen(false)}
                                    >
                                        No
                                    </Button>
                                    <Button
                                        variant="highlight"
                                        onClick={handleConfirm}
                                    >
                                        Yes
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Search & Filter Card */}
                <Card className="border border-sidebar-border/70">
                    <CardContent className="flex flex-col gap-4 p-4">
                        <div className="flex items-center justify-between gap-4">
                            <h2 className="text-lg font-semibold">
                                Search Supplies
                            </h2>
                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                                    {filter}{' '}
                                    <ChevronDownIcon className="ml-2 h-4 w-4" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-40">
                                    {(
                                        [
                                            'All',
                                            'supply',
                                            'consumables',
                                        ] as const
                                    ).map((f) => (
                                        <DropdownMenuItem
                                            key={f}
                                            onClick={() => setFilter(f)}
                                        >
                                            {f === 'All'
                                                ? 'All'
                                                : f.charAt(0).toUpperCase() +
                                                  f.slice(1)}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div className="relative w-full">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                            <Input
                                placeholder="Search..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                className="w-full pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Supply List */}
                <Card className="border border-sidebar-border/70 text-foreground">
                    <CardContent className="p-4">
                        <div className="mb-4 flex flex-col gap-1">
                            <h2 className="font-semibold">Supply List</h2>
                            <p className="text-sm">
                                Total Supplies: {filteredSupplies.length}
                            </p>
                        </div>

                        {filteredSupplies.length === 0 ? (
                            <div className="py-12 text-center">
                                <p>
                                    No supplies matched your search or filter.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Item</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Unit</TableHead>
                                            <TableHead>Reorder Level</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredSupplies.map((supply) => {
                                            const { status, variant } =
                                                getStatusInfo(supply);

                                            return (
                                                <TableRow
                                                    key={supply.supply_id}
                                                >
                                                    <TableCell>
                                                        {supply.supply_name}
                                                    </TableCell>
                                                    <TableCell>
                                                        {supply.quantity_stock}
                                                    </TableCell>
                                                    <TableCell>
                                                        {supply.unit}
                                                    </TableCell>
                                                    <TableCell>
                                                        {supply.reorder_point}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={variant}
                                                        >
                                                            {status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    supply,
                                                                )
                                                            }
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Edit Modal */}
                <Dialog open={showEditModal} onOpenChange={closeEditModal}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>
                                Edit{' '}
                                <span className="font-bold text-highlight">
                                    Item
                                </span>
                            </DialogTitle>
                            <DialogDescription>
                                Edit inventory item details. Status is
                                auto-calculated.
                            </DialogDescription>
                        </DialogHeader>

                        {editItem && (
                            <div className="flex flex-col gap-3">
                                <div>
                                    <label className="text-sm font-medium">
                                        Item Name
                                    </label>
                                    <Input
                                        value={editItem.supply_name}
                                        onChange={(e) =>
                                            setEditItem({
                                                ...editItem,
                                                supply_name: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">
                                        Unit
                                    </label>
                                    <Input
                                        value={editItem.unit}
                                        onChange={(e) =>
                                            setEditItem({
                                                ...editItem,
                                                unit: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">
                                        Quantity Stock
                                    </label>
                                    <Input
                                        type="number"
                                        value={editItem.quantity_stock}
                                        onChange={(e) =>
                                            setEditItem({
                                                ...editItem,
                                                quantity_stock:
                                                    parseInt(e.target.value) ||
                                                    0,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">
                                        Reorder Level
                                    </label>
                                    <Input
                                        type="number"
                                        value={editItem.reorder_point}
                                        onChange={(e) =>
                                            setEditItem({
                                                ...editItem,
                                                reorder_point:
                                                    parseInt(e.target.value) ||
                                                    0,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        )}

                        <DialogFooter>
                            <Button
                                variant="secondary"
                                onClick={closeEditModal}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="highlight"
                                onClick={handleSaveEdit}
                            >
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
