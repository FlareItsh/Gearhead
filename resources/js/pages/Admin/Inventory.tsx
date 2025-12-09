import Heading from '@/components/heading';
import PulloutRequestModal from '@/components/PulloutRequestModal';
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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ChevronDownIcon, Download, Edit2, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

axios.defaults.withCredentials = true;

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
    const [purchaseReference, setPurchaseReference] = useState('');
    const [purchaseDetails, setPurchaseDetails] = useState<PurchaseDetail[]>(
        [],
    );
    const [newDetail, setNewDetail] = useState<PurchaseDetail>({
        supply_id: 0,
        quantity: 0,
        unit_price: 0,
        purchase_date: new Date().toISOString().split('T')[0],
    });

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [addItemErrors, setAddItemErrors] = useState<Record<string, string>>(
        {},
    );
    const [purchaseErrors, setPurchaseErrors] = useState<
        Record<string, string>
    >({});
    const [detailError, setDetailError] = useState('');

    // Supplier states
    const [showAddSupplier, setShowAddSupplier] = useState(false);
    const [newSupplier, setNewSupplier] = useState({
        first_name: '',
        middle_name: '',
        last_name: '',
        phone_number: '',
        email: '',
    });
    const [supplierErrors, setSupplierErrors] = useState<
        Record<string, string>
    >({});

    useEffect(() => {
        loadSupplies();
        loadSuppliers();
    }, []);

    const loadSupplies = async () => {
        try {
            const res = await axios.get('/api/supplies');
            setAllSupplies(res.data);
        } catch (err) {
            console.error('Failed to fetch supplies:', err);
        }
    };

    const loadSuppliers = async () => {
        try {
            const res = await axios.get('/api/suppliers');
            setAllSuppliers(res.data);
        } catch (err) {
            console.error('Failed to fetch suppliers:', err);
        }
    };

    const handleAddDetail = () => {
        if (
            newDetail.supply_id === 0 ||
            newDetail.quantity === 0 ||
            newDetail.unit_price === 0
        ) {
            setDetailError('Please fill in all fields');
            return;
        }
        setPurchaseDetails((prev) => [...prev, { ...newDetail }]);
        setDetailError('');
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
        const errors: Record<string, string> = {};

        if (!selectedSupplier) {
            errors.supplier = 'Please select a supplier';
        }
        if (purchaseDetails.length === 0) {
            errors.items = 'Please add at least one item';
        }

        setPurchaseErrors(errors);
        if (Object.keys(errors).length > 0) {
            return;
        }

        try {
            const purchaseDate = purchaseDetails[0].purchase_date;
            const purchaseRes = await axios.post('/api/supply-purchases', {
                supplier_id: parseInt(selectedSupplier),
                purchase_date: purchaseDate,
                purchase_reference: purchaseReference,
            });

            const purchaseId = purchaseRes.data.supply_purchase_id;

            for (const detail of purchaseDetails) {
                await axios.post('/api/supply-purchase-details', {
                    supply_purchase_id: purchaseId,
                    supply_id: detail.supply_id,
                    quantity: detail.quantity,
                    unit_price: detail.unit_price,
                    purchase_date: detail.purchase_date,
                });

                // Use the new increment endpoint instead of updating the entire object
                await axios.post(
                    `/api/supplies/${detail.supply_id}/increment-stock`,
                    {
                        quantity: detail.quantity,
                    },
                );
            }

            await loadSupplies();
            setShowPurchaseModal(false);
            setSelectedSupplier('');
            setPurchaseReference('');
            setPurchaseDetails([]);
            setPurchaseErrors({});
            setNewDetail({
                supply_id: 0,
                quantity: 0,
                unit_price: 0,
                purchase_date: new Date().toISOString().split('T')[0],
            });
            setSuccessMessage('Purchase recorded successfully!');
            setShowSuccessModal(true);
            toast.success('Purchase recorded successfully!');
        } catch (err) {
            console.error('Failed to record purchase:', err);
            toast.error('Failed to record purchase');
            alert('Error recording purchase');
        }
    };

    const handleAddItem = () => {
        const errors: Record<string, string> = {};

        if (!newItem.supply_name.trim()) {
            errors.supply_name = 'Item name is required';
        }
        if (!newItem.unit.trim()) {
            errors.unit = 'Unit is required';
        }

        setAddItemErrors(errors);
        if (Object.keys(errors).length > 0) {
            return;
        }

        setConfirmMessage(`Add "${newItem.supply_name}" to inventory?`);
        setOnConfirmAction(() => async () => {
            try {
                const res = await axios.post('/api/supplies', newItem);
                setAllSupplies((prev) => [...prev, res.data]);
                setShowAddItem(false);
                setNewItem({
                    supply_name: '',
                    unit: '',
                    reorder_point: 0,
                    quantity_stock: 0,
                    supply_type: 'supply',
                });
                setAddItemErrors({});
                toast.success('Item added successfully!');
            } catch (err) {
                console.error(err);
                toast.error('Failed to add item');
            }
        });
        setConfirmOpen(true);
    };

    const handleCancelAddItem = () => {
        if (newItem.supply_name || newItem.unit || newItem.reorder_point > 0) {
            setConfirmMessage('Cancel? Your changes will be lost.');
            setOnConfirmAction(() => () => setShowAddItem(false));
            setConfirmOpen(true);
        } else {
            setShowAddItem(false);
        }
    };

    const handleConfirm = async () => {
        await onConfirmAction();
        setConfirmOpen(false);
    };

    const handleAddSupplier = async () => {
        const errors: Record<string, string> = {};

        if (!newSupplier.first_name.trim()) {
            errors.first_name = 'First name is required';
        }
        if (!newSupplier.last_name.trim()) {
            errors.last_name = 'Last name is required';
        }
        if (!newSupplier.phone_number.trim()) {
            errors.phone_number = 'Phone number is required';
        }
        if (!newSupplier.email.trim()) {
            errors.email = 'Email is required';
        }

        setSupplierErrors(errors);
        if (Object.keys(errors).length > 0) {
            return;
        }

        try {
            const res = await axios.post('/api/suppliers', newSupplier);
            setAllSuppliers((prev) => [...prev, res.data]);
            setShowAddSupplier(false);
            setNewSupplier({
                first_name: '',
                middle_name: '',
                last_name: '',
                phone_number: '',
                email: '',
            });
            setSupplierErrors({});
            setSuccessMessage('Supplier added successfully!');
            setShowSuccessModal(true);
            toast.success('Supplier added successfully!');
            await loadSuppliers();
        } catch (err) {
            console.error('Failed to add supplier:', err);
            toast.error('Failed to add supplier');
            alert('Error adding supplier');
        }
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
            setShowEditModal(false);
            setEditItem(null);
            toast.success('Item updated successfully!');
        } catch (err) {
            console.error(err);
            toast.error('Failed to update item');
        }
    };

    const filteredSupplies = useMemo(() => {
        const term = searchValue.toLowerCase().trim();
        return allSupplies.filter((s) => {
            const matchesSearch = s.supply_name.toLowerCase().includes(term);
            const matchesFilter = filter === 'All' || s.supply_type === filter;
            return matchesSearch && matchesFilter;
        });
    }, [allSupplies, searchValue, filter]);

    const getStatusInfo = (supply: Supply) => {
        const qty = supply.quantity_stock;
        const reorder = supply.reorder_point;
        if (qty === 0)
            return { status: 'No Stock', variant: 'destructive' as const };
        if (qty <= reorder)
            return { status: 'Low Stock', variant: 'warning' as const };
        return { status: 'In Stock', variant: 'success' as const };
    };

    const openEditModal = (supply: Supply) => {
        setEditItem({ ...supply });
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setTimeout(() => setEditItem(null), 300);
    };

    const downloadPDF = () => {
        const doc = new jsPDF('p', 'mm', 'a4');
        doc.setFontSize(20);
        doc.text('Gearhead - Inventory Report', 14, 20);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(
            `Generated: ${new Date().toLocaleDateString('en-PH')}`,
            14,
            28,
        );

        const tableData = filteredSupplies.map((s) => [
            s.supply_name,
            s.unit,
            s.quantity_stock.toString(),
            s.reorder_point.toString(),
            s.supply_type.charAt(0).toUpperCase() + s.supply_type.slice(1),
        ]);

        autoTable(doc, {
            head: [['Item', 'Unit', 'Stock', 'Reorder Level', 'Type']],
            body: tableData,
            startY: 35,
            theme: 'striped',
            headStyles: { fillColor: [255, 226, 38] },
        });

        doc.save(`inventory-${new Date().toISOString().split('T')[0]}.pdf`);
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
                    <div className="flex gap-3">
                        <Button onClick={downloadPDF} variant="secondary">
                            <Download className="mr-2 h-4 w-4" /> Export PDF
                        </Button>

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
                                        <span className="text-yellow-400">
                                            Item
                                        </span>
                                    </DialogTitle>
                                    <DialogDescription>
                                        Record a new inventory item.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="flex flex-col gap-4">
                                    <div>
                                        <label className="text-sm font-medium">
                                            Item Name
                                        </label>
                                        <Input
                                            placeholder="e.g., Engine Oil"
                                            value={newItem.supply_name}
                                            onChange={(e) =>
                                                setNewItem({
                                                    ...newItem,
                                                    supply_name: e.target.value,
                                                })
                                            }
                                        />
                                        {addItemErrors.supply_name && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {addItemErrors.supply_name}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">
                                            Unit
                                        </label>
                                        <Input
                                            placeholder="e.g., Liter, Piece"
                                            value={newItem.unit}
                                            onChange={(e) =>
                                                setNewItem({
                                                    ...newItem,
                                                    unit: e.target.value,
                                                })
                                            }
                                        />
                                        {addItemErrors.unit && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {addItemErrors.unit}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">
                                            Reorder Level
                                        </label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="1"
                                            placeholder="0"
                                            value={
                                                newItem.reorder_point === 0
                                                    ? ''
                                                    : newItem.reorder_point
                                            }
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (
                                                    val === '' ||
                                                    parseInt(val) >= 0
                                                ) {
                                                    setNewItem({
                                                        ...newItem,
                                                        reorder_point:
                                                            val === ''
                                                                ? 0
                                                                : parseInt(val),
                                                    });
                                                }
                                            }}
                                            onKeyDown={(e) =>
                                                ['-', 'e', 'E'].includes(
                                                    e.key,
                                                ) && e.preventDefault()
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

                        {/* PURCHASE MODAL */}
                        <Dialog
                            open={showPurchaseModal}
                            onOpenChange={setShowPurchaseModal}
                        >
                            <DialogTrigger asChild>
                                <Button variant="highlight">
                                    + Add Purchase
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                                <DialogHeader>
                                    <DialogTitle>
                                        Record{' '}
                                        <span className="text-yellow-400">
                                            Purchase
                                        </span>
                                    </DialogTitle>
                                    <DialogDescription>
                                        Add supplies from a supplier
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium">
                                            Supplier
                                        </label>
                                        <Select
                                            value={selectedSupplier}
                                            onValueChange={setSelectedSupplier}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose supplier..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {allSuppliers.map((s) => (
                                                    <SelectItem
                                                        key={s.supplier_id}
                                                        value={s.supplier_id.toString()}
                                                    >
                                                        {s.first_name}{' '}
                                                        {s.last_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {purchaseErrors.supplier && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {purchaseErrors.supplier}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium">
                                            Reference (Optional)
                                        </label>
                                        <Input
                                            placeholder="INV-001, PO-2025-001..."
                                            value={purchaseReference}
                                            onChange={(e) =>
                                                setPurchaseReference(
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium">
                                            Add Items
                                        </label>
                                        <div className="mt-3 rounded-lg border bg-muted/30 p-4">
                                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                                {/* SUPPLY - FULL WIDTH FIX */}
                                                <div className="w-full">
                                                    <label className="text-xs font-medium">
                                                        Supply
                                                    </label>
                                                    <Select
                                                        value={
                                                            newDetail.supply_id ===
                                                            0
                                                                ? undefined
                                                                : newDetail.supply_id.toString()
                                                        }
                                                        onValueChange={(v) =>
                                                            setNewDetail({
                                                                ...newDetail,
                                                                supply_id:
                                                                    parseInt(v),
                                                            })
                                                        }
                                                    >
                                                        <SelectTrigger className="h-9 w-full">
                                                            <SelectValue placeholder="Select supply..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {allSupplies.map(
                                                                (s) => (
                                                                    <SelectItem
                                                                        key={
                                                                            s.supply_id
                                                                        }
                                                                        value={s.supply_id.toString()}
                                                                    >
                                                                        {
                                                                            s.supply_name
                                                                        }
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* QUANTITY */}
                                                <div className="w-full">
                                                    <label className="text-xs font-medium">
                                                        Quantity
                                                    </label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="1"
                                                        placeholder="0"
                                                        className="h-9"
                                                        value={
                                                            newDetail.quantity ===
                                                            0
                                                                ? ''
                                                                : newDetail.quantity
                                                        }
                                                        onChange={(e) => {
                                                            const val =
                                                                e.target.value;
                                                            if (
                                                                val === '' ||
                                                                parseFloat(
                                                                    val,
                                                                ) >= 0
                                                            ) {
                                                                setNewDetail({
                                                                    ...newDetail,
                                                                    quantity:
                                                                        val ===
                                                                        ''
                                                                            ? 0
                                                                            : parseFloat(
                                                                                  val,
                                                                              ),
                                                                });
                                                            }
                                                        }}
                                                        onKeyDown={(e) =>
                                                            [
                                                                '-',
                                                                'e',
                                                                'E',
                                                            ].includes(e.key) &&
                                                            e.preventDefault()
                                                        }
                                                    />
                                                </div>

                                                {/* UNIT PRICE */}
                                                <div className="w-full">
                                                    <label className="text-xs font-medium">
                                                        Unit Price
                                                    </label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        className="h-9"
                                                        value={
                                                            newDetail.unit_price ===
                                                            0
                                                                ? ''
                                                                : newDetail.unit_price
                                                        }
                                                        onChange={(e) => {
                                                            const val =
                                                                e.target.value;
                                                            if (
                                                                val === '' ||
                                                                parseFloat(
                                                                    val,
                                                                ) >= 0
                                                            ) {
                                                                setNewDetail({
                                                                    ...newDetail,
                                                                    unit_price:
                                                                        val ===
                                                                        ''
                                                                            ? 0
                                                                            : parseFloat(
                                                                                  val,
                                                                              ),
                                                                });
                                                            }
                                                        }}
                                                        onKeyDown={(e) =>
                                                            [
                                                                '-',
                                                                'e',
                                                                'E',
                                                            ].includes(e.key) &&
                                                            e.preventDefault()
                                                        }
                                                    />
                                                </div>

                                                {/* DATE */}
                                                <div className="w-full">
                                                    <label className="text-xs font-medium">
                                                        Date
                                                    </label>
                                                    <Input
                                                        type="date"
                                                        className="h-9"
                                                        value={
                                                            newDetail.purchase_date
                                                        }
                                                        onChange={(e) =>
                                                            setNewDetail({
                                                                ...newDetail,
                                                                purchase_date:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <Button
                                                className="mt-4 w-full"
                                                variant="highlight"
                                                onClick={handleAddDetail}
                                            >
                                                Add to List
                                            </Button>
                                        </div>
                                        {detailError && (
                                            <p className="mt-2 text-sm text-red-500">
                                                {detailError}
                                            </p>
                                        )}

                                        {purchaseDetails.length > 0 && (
                                            <div className="mt-4 max-h-64 overflow-y-auto rounded border">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-muted">
                                                        <tr>
                                                            <th className="px-3 py-2 text-left">
                                                                Item
                                                            </th>
                                                            <th className="px-3 py-2 text-center">
                                                                Qty
                                                            </th>
                                                            <th className="px-3 py-2 text-center">
                                                                Price
                                                            </th>
                                                            <th className="px-3 py-2 text-center">
                                                                Total
                                                            </th>
                                                            <th className="px-3 py-2 text-center"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {purchaseDetails.map(
                                                            (d, i) => {
                                                                const supply =
                                                                    allSupplies.find(
                                                                        (s) =>
                                                                            s.supply_id ===
                                                                            d.supply_id,
                                                                    );
                                                                const total =
                                                                    d.quantity *
                                                                    d.unit_price;
                                                                return (
                                                                    <tr
                                                                        key={i}
                                                                        className="border-t"
                                                                    >
                                                                        <td className="px-3 py-2">
                                                                            {supply?.supply_name ||
                                                                                '—'}
                                                                        </td>
                                                                        <td className="px-3 py-2 text-center">
                                                                            {
                                                                                d.quantity
                                                                            }
                                                                        </td>
                                                                        <td className="px-3 py-2 text-right">
                                                                            ₱
                                                                            {d.unit_price.toFixed(
                                                                                2,
                                                                            )}
                                                                        </td>
                                                                        <td className="px-3 py-2 text-right font-medium">
                                                                            ₱
                                                                            {total.toFixed(
                                                                                2,
                                                                            )}
                                                                        </td>
                                                                        <td className="px-3 py-2 text-center">
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleRemoveDetail(
                                                                                        i,
                                                                                    )
                                                                                }
                                                                                className="text-red-600 hover:text-red-800"
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            },
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}

                                        {purchaseDetails.length > 0 && (
                                            <div className="mt-4 border-t pt-3 text-right">
                                                <div className="text-lg font-bold">
                                                    Total: ₱
                                                    {purchaseDetails
                                                        .reduce(
                                                            (sum, d) =>
                                                                sum +
                                                                d.quantity *
                                                                    d.unit_price,
                                                            0,
                                                        )
                                                        .toFixed(2)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {purchaseErrors.items && (
                                        <p className="text-sm text-red-500">
                                            {purchaseErrors.items}
                                        </p>
                                    )}
                                </div>

                                <DialogFooter>
                                    <Button
                                        variant="secondary"
                                        onClick={() =>
                                            setShowPurchaseModal(false)
                                        }
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

                        {/* PULLOUT REQUEST MODAL */}
                        <PulloutRequestModal
                            supplies={allSupplies}
                            onSuccess={loadSupplies}
                        />

                        {/* ADD SUPPLIER MODAL */}
                        <Dialog
                            open={showAddSupplier}
                            onOpenChange={setShowAddSupplier}
                        >
                            <DialogTrigger asChild>
                                <Button variant="highlight">
                                    + Add Supplier
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>
                                        Add{' '}
                                        <span className="text-yellow-400">
                                            Supplier
                                        </span>
                                    </DialogTitle>
                                    <DialogDescription>
                                        Add a new supplier to the system
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium">
                                                First Name
                                            </label>
                                            <Input
                                                placeholder="John"
                                                value={newSupplier.first_name}
                                                onChange={(e) =>
                                                    setNewSupplier({
                                                        ...newSupplier,
                                                        first_name:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                            {supplierErrors.first_name && (
                                                <p className="mt-1 text-sm text-red-500">
                                                    {supplierErrors.first_name}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">
                                                Middle Name (Optional)
                                            </label>
                                            <Input
                                                placeholder="M."
                                                value={newSupplier.middle_name}
                                                onChange={(e) =>
                                                    setNewSupplier({
                                                        ...newSupplier,
                                                        middle_name:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">
                                            Last Name
                                        </label>
                                        <Input
                                            placeholder="Doe"
                                            value={newSupplier.last_name}
                                            onChange={(e) =>
                                                setNewSupplier({
                                                    ...newSupplier,
                                                    last_name: e.target.value,
                                                })
                                            }
                                        />
                                        {supplierErrors.last_name && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {supplierErrors.last_name}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">
                                            Phone Number
                                        </label>
                                        <Input
                                            placeholder="09123456789"
                                            value={newSupplier.phone_number}
                                            onChange={(e) =>
                                                setNewSupplier({
                                                    ...newSupplier,
                                                    phone_number:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                        {supplierErrors.phone_number && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {supplierErrors.phone_number}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">
                                            Email
                                        </label>
                                        <Input
                                            type="email"
                                            placeholder="supplier@example.com"
                                            value={newSupplier.email}
                                            onChange={(e) =>
                                                setNewSupplier({
                                                    ...newSupplier,
                                                    email: e.target.value,
                                                })
                                            }
                                        />
                                        {supplierErrors.email && (
                                            <p className="mt-1 text-sm text-red-500">
                                                {supplierErrors.email}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            setShowAddSupplier(false);
                                            setNewSupplier({
                                                first_name: '',
                                                middle_name: '',
                                                last_name: '',
                                                phone_number: '',
                                                email: '',
                                            });
                                            setSupplierErrors({});
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="highlight"
                                        onClick={handleAddSupplier}
                                    >
                                        Add Supplier
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Search & Filter */}
                <Card className="bg-background">
                    <CardContent className="p-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search supplies..."
                                    value={searchValue}
                                    onChange={(e) =>
                                        setSearchValue(e.target.value)
                                    }
                                    className="pl-10 text-foreground"
                                />
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="gap-2">
                                        {filter}{' '}
                                        <ChevronDownIcon className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
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
                                                ? 'All Items'
                                                : f.charAt(0).toUpperCase() +
                                                  f.slice(1)}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardContent>
                </Card>

                {/* Supply List Table */}
                <Card className="bg-background text-foreground">
                    <CardContent className="p-0">
                        <div className="border-b p-6">
                            <h2 className="text-lg font-semibold">
                                Supply List
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {filteredSupplies.length} item
                                {filteredSupplies.length !== 1 && 's'}
                            </p>
                        </div>

                        {filteredSupplies.length === 0 ? (
                            <div className="py-24 text-center text-muted-foreground">
                                No supplies found.
                            </div>
                        ) : (
                            <>
                                {/* Desktop: Scrollable Table */}
                                <div className="hidden lg:block">
                                    <div className="custom-scrollbar max-h-[65vh] overflow-y-auto">
                                        <Table>
                                            <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                                                <TableRow>
                                                    <TableHead>Item</TableHead>
                                                    <TableHead className="text-center">
                                                        Stock
                                                    </TableHead>
                                                    <TableHead>Unit</TableHead>
                                                    <TableHead className="text-center">
                                                        Reorder
                                                    </TableHead>
                                                    <TableHead className="text-center">
                                                        Status
                                                    </TableHead>
                                                    <TableHead className="text-center">
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
                                                            >
                                                                <TableCell className="font-medium">
                                                                    {
                                                                        supply.supply_name
                                                                    }
                                                                </TableCell>
                                                                <TableCell className="text-center font-bold">
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
                                                className="rounded-xl border border-border/60 p-5 shadow-sm"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-foreground">
                                                            {supply.supply_name}
                                                        </h3>
                                                        <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                                                            <div className="flex justify-between">
                                                                <span>
                                                                    Stock:
                                                                </span>
                                                                <span className="font-bold text-foreground">
                                                                    {
                                                                        supply.quantity_stock
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span>
                                                                    Unit:
                                                                </span>
                                                                <span className="text-foreground">
                                                                    {
                                                                        supply.unit
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span>
                                                                    Reorder:
                                                                </span>
                                                                <span className="text-foreground">
                                                                    {
                                                                        supply.reorder_point
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-between pt-2">
                                                                <span>
                                                                    Status:
                                                                </span>
                                                                <Badge
                                                                    variant={
                                                                        variant
                                                                    }
                                                                >
                                                                    {status}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            openEditModal(
                                                                supply,
                                                            )
                                                        }
                                                        className="mt-2 shrink-0"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* EDIT MODAL */}
                <Dialog open={showEditModal} onOpenChange={closeEditModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Item</DialogTitle>
                        </DialogHeader>
                        {editItem && (
                            <div className="space-y-4">
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
                                        Current Stock
                                    </label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={editItem.quantity_stock}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (
                                                val === '' ||
                                                parseInt(val) >= 0
                                            ) {
                                                setEditItem({
                                                    ...editItem,
                                                    quantity_stock:
                                                        val === ''
                                                            ? 0
                                                            : parseInt(val),
                                                });
                                            }
                                        }}
                                        onKeyDown={(e) =>
                                            ['-', 'e', 'E'].includes(e.key) &&
                                            e.preventDefault()
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">
                                        Reorder Level
                                    </label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={editItem.reorder_point}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (
                                                val === '' ||
                                                parseInt(val) >= 0
                                            ) {
                                                setEditItem({
                                                    ...editItem,
                                                    reorder_point:
                                                        val === ''
                                                            ? 0
                                                            : parseInt(val),
                                                });
                                            }
                                        }}
                                        onKeyDown={(e) =>
                                            ['-', 'e', 'E'].includes(e.key) &&
                                            e.preventDefault()
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

                {/* Confirmation & Success Modals */}
                <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirm</DialogTitle>
                        </DialogHeader>
                        <p className="py-4 text-center">{confirmMessage}</p>
                        <DialogFooter>
                            <Button
                                variant="secondary"
                                onClick={() => setConfirmOpen(false)}
                            >
                                No
                            </Button>
                            <Button variant="highlight" onClick={handleConfirm}>
                                Yes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={showSuccessModal}
                    onOpenChange={setShowSuccessModal}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="text-green-600">
                                Success
                            </DialogTitle>
                        </DialogHeader>
                        <p className="py-4 text-center">{successMessage}</p>
                        <DialogFooter>
                            <Button
                                variant="highlight"
                                onClick={() => setShowSuccessModal(false)}
                            >
                                Done
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
