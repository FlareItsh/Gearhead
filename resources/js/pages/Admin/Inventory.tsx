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
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { ChevronDownIcon, Edit2, Search, Trash2 } from 'lucide-react';
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

interface Supplier {
    supplier_id: number;
    first_name: string;
    middle_name: string;
    last_name: string;
    phone_number: string;
    email: string;
}

interface PurchaseDetail {
    supply_id: number;
    quantity: number;
    unit_price: number;
    purchase_date: string;
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

    // Purchase states
    const [allSuppliers, setAllSuppliers] = useState<Supplier[]>([]);
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [purchaseDetails, setPurchaseDetails] = useState<PurchaseDetail[]>([]);
    const [newDetail, setNewDetail] = useState<PurchaseDetail>({
        supply_id: 0,
        quantity: 0,
        unit_price: 0,
        purchase_date: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        loadSupplies();
        loadSuppliers();
    }, []);

    const loadSupplies = async () => {
        try {
            const res = await axios.get('/supplies');
            setAllSupplies(res.data);
        } catch (err) {
            console.error('Failed to fetch supplies:', err);
        }
    };

    const loadSuppliers = async () => {
        try {
            const res = await axios.get('/suppliers');
            setAllSuppliers(res.data);
        } catch (err) {
            console.error('Failed to fetch suppliers:', err);
        }
    };

    const handleAddDetail = () => {
        if (newDetail.supply_id === 0 || newDetail.quantity === 0 || newDetail.unit_price === 0) {
            alert('Please fill in all fields');
            return;
        }
        setPurchaseDetails((prev) => [...prev, newDetail]);
        setNewDetail({
            supply_id: 0,
            quantity: 0,
            unit_price: 0,
            purchase_date: new Date().toISOString().split('T')[0],
        });
    };

    const handleRemoveDetail = (index: number) => {
        setPurchaseDetails((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmitPurchase = async () => {
        if (!selectedSupplier || purchaseDetails.length === 0) {
            alert('Please select a supplier and add at least one item');
            return;
        }

        try {
            // Create purchase record
            const purchaseRes = await axios.post('/supply-purchases', {
                supplier_id: parseInt(selectedSupplier),
            });

            const purchaseId = purchaseRes.data.supply_purchase_id;

            // Create purchase details
            for (const detail of purchaseDetails) {
                await axios.post('/supply-purchase-details', {
                    supply_purchase_id: purchaseId,
                    supply_id: detail.supply_id,
                    quantity: detail.quantity,
                    unit_price: detail.unit_price,
                    purchase_date: detail.purchase_date,
                });

                // Update supply quantity
                const supply = allSupplies.find(s => s.supply_id === detail.supply_id);
                if (supply) {
                    await axios.put(`/supplies/${detail.supply_id}`, {
                        ...supply,
                        quantity_stock: Number(supply.quantity_stock) + detail.quantity,
                    });
                }
            }

            // Reload supplies and reset form
            await loadSupplies();
            setShowPurchaseModal(false);
            setSelectedSupplier('');
            setPurchaseDetails([]);
            setNewDetail({
                supply_id: 0,
                quantity: 0,
                unit_price: 0,
                purchase_date: new Date().toISOString().split('T')[0],
            });

            alert('Purchase recorded successfully!');
        } catch (err) {
            console.error('Failed to record purchase:', err);
            alert('Failed to record purchase');
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

                        {/* Add Purchase Dialog */}
                        <Dialog
                            open={showPurchaseModal}
                            onOpenChange={setShowPurchaseModal}
                        >
                            <DialogTrigger asChild>
                                <Button variant="outline">+ Add Purchase</Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[90vh] w-full overflow-y-auto rounded-xl sm:max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>
                                        Record{' '}
                                        <span className="font-bold text-highlight">
                                            Purchase
                                        </span>
                                    </DialogTitle>
                                    <DialogDescription>
                                        Add a new supply purchase from a supplier.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="flex flex-col gap-4">
                                    {/* Supplier Selection */}
                                    <div>
                                        <label className="text-sm font-medium">
                                            Select Supplier
                                        </label>
                                        <Select
                                            value={selectedSupplier}
                                            onValueChange={setSelectedSupplier}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Choose a supplier..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {allSuppliers.map((supplier) => (
                                                    <SelectItem
                                                        key={supplier.supplier_id}
                                                        value={supplier.supplier_id.toString()}
                                                    >
                                                        {supplier.first_name} {supplier.last_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Purchase Items */}
                                    <div>
                                        <label className="text-sm font-medium">
                                            Purchase Items
                                        </label>
                                        <div className="mt-2 flex flex-col gap-3">
                                            {/* Add Item Form */}
                                            <div className="flex flex-col gap-2 border border-border/50 rounded-lg p-3 bg-muted/30">
                                                <div className="grid grid-cols-4 gap-2">
                                                    <div>
                                                        <label className="text-xs font-medium">
                                                            Supply
                                                        </label>
                                                        <Select
                                                            value={newDetail.supply_id.toString()}
                                                            onValueChange={(val) =>
                                                                setNewDetail({
                                                                    ...newDetail,
                                                                    supply_id: parseInt(val),
                                                                })
                                                            }
                                                        >
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Supply" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {allSupplies.map((supply) => (
                                                                    <SelectItem
                                                                        key={supply.supply_id}
                                                                        value={supply.supply_id.toString()}
                                                                    >
                                                                        {supply.supply_name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-medium">
                                                            Quantity
                                                        </label>
                                                        <Input
                                                            type="number"
                                                            placeholder="Qty"
                                                            value={newDetail.quantity}
                                                            onChange={(e) =>
                                                                setNewDetail({
                                                                    ...newDetail,
                                                                    quantity: parseFloat(e.target.value) || 0,
                                                                })
                                                            }
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-medium">
                                                            Unit Price
                                                        </label>
                                                        <Input
                                                            type="number"
                                                            placeholder="Price"
                                                            value={newDetail.unit_price}
                                                            onChange={(e) =>
                                                                setNewDetail({
                                                                    ...newDetail,
                                                                    unit_price: parseFloat(e.target.value) || 0,
                                                                })
                                                            }
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-medium">
                                                            Date
                                                        </label>
                                                        <Input
                                                            type="date"
                                                            value={newDetail.purchase_date}
                                                            onChange={(e) =>
                                                                setNewDetail({
                                                                    ...newDetail,
                                                                    purchase_date: e.target.value,
                                                                })
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="highlight"
                                                    onClick={handleAddDetail}
                                                    className="w-full"
                                                >
                                                    Add Item
                                                </Button>
                                            </div>

                                            {/* Items List */}
                                            {purchaseDetails.length > 0 && (
                                                <div className="mt-3 max-h-48 overflow-y-auto">
                                                    <table className="w-full text-sm">
                                                        <thead>
                                                            <tr className="border-b">
                                                                <th className="text-left py-2">
                                                                    Supply
                                                                </th>
                                                                <th className="text-center py-2">
                                                                    Qty
                                                                </th>
                                                                <th className="text-center py-2">
                                                                    Unit Price
                                                                </th>
                                                                <th className="text-center py-2">
                                                                    Total
                                                                </th>
                                                                <th className="text-center py-2">
                                                                    Action
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {purchaseDetails.map((detail, index) => {
                                                                const supply = allSupplies.find(
                                                                    (s) => s.supply_id === detail.supply_id,
                                                                );
                                                                const total =
                                                                    detail.quantity * detail.unit_price;
                                                                return (
                                                                    <tr key={index} className="border-b">
                                                                        <td className="py-2">
                                                                            {supply?.supply_name || 'N/A'}
                                                                        </td>
                                                                        <td className="text-center">
                                                                            {detail.quantity}
                                                                        </td>
                                                                        <td className="text-center">
                                                                            ₱
                                                                            {detail.unit_price.toFixed(2)}
                                                                        </td>
                                                                        <td className="text-center">
                                                                            ₱{total.toFixed(2)}
                                                                        </td>
                                                                        <td className="text-center">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    handleRemoveDetail(
                                                                                        index,
                                                                                    )
                                                                                }
                                                                                className="text-red-500 hover:text-red-700"
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Grand Total */}
                                    {purchaseDetails.length > 0 && (
                                        <div className="flex justify-end border-t pt-2">
                                            <div className="text-lg font-semibold">
                                                Grand Total: ₱
                                                {purchaseDetails
                                                    .reduce(
                                                        (sum, detail) =>
                                                            sum + detail.quantity * detail.unit_price,
                                                        0,
                                                    )
                                                    .toFixed(2)}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <DialogFooter className="flex justify-end gap-3">
                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            setShowPurchaseModal(false);
                                            setSelectedSupplier('');
                                            setPurchaseDetails([]);
                                            setNewDetail({
                                                supply_id: 0,
                                                quantity: 0,
                                                unit_price: 0,
                                                purchase_date: new Date()
                                                    .toISOString()
                                                    .split('T')[0],
                                            });
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="highlight"
                                        onClick={handleSubmitPurchase}
                                    >
                                        Record Purchase
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
                <Card className="border border-border/50 bg-background text-foreground">
                    <CardContent className="flex flex-col gap-4 p-4">
                        <div className="flex items-center justify-between gap-4">
                            <h2 className="text-lg font-semibold">
                                Search Supplies
                            </h2>
                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
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
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                className="w-full border-border bg-background pl-10 text-foreground"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Supply List */}
                <Card className="border border-sidebar-border/70 bg-background text-foreground">
                    <CardContent className="p-0">
                        {/* Header */}
                        <div className="border-b border-border/50 p-6">
                            <div className="flex flex-col gap-1">
                                <h2 className="text-lg font-semibold">
                                    Supply List
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Total Supplies: {filteredSupplies.length}
                                </p>
                            </div>
                        </div>

                        {filteredSupplies.length === 0 ? (
                            <div className="py-32 text-center text-muted-foreground">
                                No supplies found matching your search or
                                filter.
                            </div>
                        ) : (
                            <>
                                {/* Desktop: Scrollable Table with Sticky Header */}
                                <div className="hidden lg:block">
                                    <div className="max-h-[65vh] overflow-y-auto">
                                        <Table>
                                            <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                                                <TableRow className="border-b border-border/50">
                                                    <TableHead className="font-semibold">
                                                        Item
                                                    </TableHead>
                                                    <TableHead className="text-center font-semibold">
                                                        Quantity
                                                    </TableHead>
                                                    <TableHead className="font-semibold">
                                                        Unit
                                                    </TableHead>
                                                    <TableHead className="text-center font-semibold">
                                                        Reorder Level
                                                    </TableHead>
                                                    <TableHead className="text-center font-semibold">
                                                        Status
                                                    </TableHead>
                                                    <TableHead className="text-center font-semibold">
                                                        Action
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredSupplies.map(
                                                    (supply) => {
                                                        const {
                                                            status,
                                                            variant,
                                                        } =
                                                            getStatusInfo(
                                                                supply,
                                                            );

                                                        return (
                                                            <TableRow
                                                                key={
                                                                    supply.supply_id
                                                                }
                                                                className="border-b border-border/30 transition-colors hover:bg-muted/40"
                                                            >
                                                                <TableCell className="font-medium">
                                                                    {
                                                                        supply.supply_name
                                                                    }
                                                                </TableCell>
                                                                <TableCell className="text-center font-semibold">
                                                                    {
                                                                        supply.quantity_stock
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    {
                                                                        supply.unit
                                                                    }
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    {
                                                                        supply.reorder_point
                                                                    }
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    <Badge
                                                                        variant={
                                                                            variant
                                                                        }
                                                                        className="font-medium"
                                                                    >
                                                                        {status}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() =>
                                                                            openEditModal(
                                                                                supply,
                                                                            )
                                                                        }
                                                                        className="hover:bg-muted/80"
                                                                    >
                                                                        <Edit2 className="h-4 w-4" />
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    },
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>

                                {/* Mobile: Responsive Cards */}
                                <div className="block space-y-4 p-4 lg:hidden">
                                    {filteredSupplies.map((supply) => {
                                        const { status, variant } =
                                            getStatusInfo(supply);

                                        return (
                                            <div
                                                key={supply.supply_id}
                                                className="rounded-xl border border-border/60 bg-card p-5 shadow-sm"
                                            >
                                                <div className="mb-4 flex items-start justify-between">
                                                    <div>
                                                        <h3 className="font-semibold text-foreground">
                                                            {supply.supply_name}
                                                        </h3>
                                                        <p className="mt-1 text-sm text-muted-foreground">
                                                            {supply.unit}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <Badge
                                                            variant={variant}
                                                            className="font-medium"
                                                        >
                                                            {status}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-4 border-t border-border/40 pt-4 text-sm">
                                                    <div>
                                                        <p className="text-muted-foreground">
                                                            Stock
                                                        </p>
                                                        <p className="text-center text-lg font-bold">
                                                            {
                                                                supply.quantity_stock
                                                            }
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">
                                                            Reorder
                                                        </p>
                                                        <p className="text-center font-medium">
                                                            {
                                                                supply.reorder_point
                                                            }
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center justify-center">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    supply,
                                                                )
                                                            }
                                                        >
                                                            <Edit2 className="mr-1 h-4 w-4" />
                                                            Edit
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
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
