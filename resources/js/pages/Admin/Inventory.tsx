import React, { useState, useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ChevronDownIcon, Edit2 } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inventory', href: '/inventory' },
];

interface Supply {
    supply_name: string;
    unit: string;
    quantity_stock: number;
    reorder_point: number;
    supply_type: 'consumables' | 'supply';
}

const mockSupplies: Supply[] = [
    { supply_name: 'Car shampoo', unit: 'Bottle', quantity_stock: 50, reorder_point: 5, supply_type: 'consumables' },
    { supply_name: 'Degreasers', unit: 'Bottle', quantity_stock: 65, reorder_point: 5, supply_type: 'consumables' },
    { supply_name: 'Wheel cleaner', unit: 'Bottle', quantity_stock: 18, reorder_point: 5, supply_type: 'consumables' },
    { supply_name: 'Glass cleaner', unit: 'Bottle', quantity_stock: 20, reorder_point: 5, supply_type: 'consumables' },
    { supply_name: 'Interior cleaner', unit: 'Bottle', quantity_stock: 65, reorder_point: 5, supply_type: 'consumables' },
    { supply_name: 'Upholstery shampoo', unit: 'gal', quantity_stock: 100, reorder_point: 5, supply_type: 'consumables' },
    { supply_name: 'Tire shine', unit: 'Bottle', quantity_stock: 70, reorder_point: 5, supply_type: 'consumables' },
    { supply_name: 'Wax', unit: 'gal', quantity_stock: 26, reorder_point: 5, supply_type: 'consumables' },
    { supply_name: 'Disinfectant spray', unit: 'Bottle', quantity_stock: 5, reorder_point: 5, supply_type: 'consumables' },
    { supply_name: 'Pressure washer', unit: 'pc', quantity_stock: 5, reorder_point: 5, supply_type: 'supply' },
    { supply_name: 'Water hose', unit: 'pc', quantity_stock: 5, reorder_point: 5, supply_type: 'supply' },
    { supply_name: 'Buckets', unit: 'pc', quantity_stock: 6, reorder_point: 5, supply_type: 'supply' },
    { supply_name: 'Vacuum cleaner', unit: 'pc', quantity_stock: 45, reorder_point: 5, supply_type: 'supply' },
    { supply_name: 'Buffer machine', unit: 'pc', quantity_stock: 8, reorder_point: 5, supply_type: 'supply' },
    { supply_name: 'Microfiber towel', unit: 'pc', quantity_stock: 15, reorder_point: 5, supply_type: 'supply' },
    { supply_name: 'Wash mitts or sponges', unit: 'pc', quantity_stock: 9, reorder_point: 5, supply_type: 'supply' },
    { supply_name: 'Drying towel', unit: 'pc', quantity_stock: 13, reorder_point: 5, supply_type: 'supply' },
    { supply_name: 'Brushes', unit: 'pc', quantity_stock: 9, reorder_point: 5, supply_type: 'supply' },
    { supply_name: 'Detailing brushes', unit: 'pc', quantity_stock: 4, reorder_point: 5, supply_type: 'supply' },
    { supply_name: 'Applicator pads', unit: 'pc', quantity_stock: 12, reorder_point: 5, supply_type: 'supply' },
];

export default function InventoryPage() {
    const [allSupplies, setAllSupplies] = useState<Supply[]>(mockSupplies);
    const [searchValue, setSearchValue] = useState('');
    const [filter, setFilter] = useState<'All' | 'Item' | 'Unit' | 'Status'>('All');

    const [showAddItem, setShowAddItem] = useState(false);
    const [showAddPurchase, setShowAddPurchase] = useState(false);
    const [showExportReport, setShowExportReport] = useState(false);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [onConfirmAction, setOnConfirmAction] = useState<() => void>(() => {});

    const [newItem, setNewItem] = useState({
        supply_name: '',
        unit: '',
        reorder_point: 0,
        quantity_stock: 0,
        supply_type: 'supply' as 'consumables' | 'supply',
    });

    const [editItem, setEditItem] = useState<Supply | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const handleAddItem = () => {
        if (!newItem.supply_name || !newItem.unit) return;

        setConfirmMessage(`Are you sure you want to add "${newItem.supply_name}" to inventory?`);
        setOnConfirmAction(() => () => {
            setAllSupplies(prev => [...prev, { ...newItem }]);
            setNewItem({ supply_name: '', unit: '', reorder_point: 0, quantity_stock: 0, supply_type: 'supply' });
            setShowAddItem(false);
        });
        setConfirmOpen(true);
    };

    const handleCancelAddItem = () => {
        if (!newItem.supply_name && !newItem.unit && newItem.reorder_point === 0) {
            setShowAddItem(false);
        } else {
            setConfirmMessage("Are you sure you want to cancel? Your input will be lost.");
            setOnConfirmAction(() => () => setShowAddItem(false));
            setConfirmOpen(true);
        }
    };

    const handleConfirm = async () => {
        await onConfirmAction();
        setConfirmOpen(false);
    };

    const handleSaveEdit = () => {
        if (!editItem) return;
        setAllSupplies(prev => prev.map(s =>
            s.supply_name === editItem.supply_name ? editItem : s
        ));
        setEditItem(null);
        setShowEditModal(false);
    };

    const filteredSupplies = useMemo(() => {
        return allSupplies.filter((s) => {
            const term = searchValue.toLowerCase();
            let status = s.quantity_stock <= s.reorder_point ? 'Low Stock' : 'In Stock';

            if (filter === 'All') {
                return s.supply_name.toLowerCase().includes(term) ||
                    s.unit.toLowerCase().includes(term) ||
                    status.toLowerCase().includes(term);
            }
            if (filter === 'Item') return s.supply_name.toLowerCase().includes(term);
            if (filter === 'Unit') return s.unit.toLowerCase().includes(term);
            if (filter === 'Status') return status.toLowerCase().includes(term);

            return true;
        });
    }, [allSupplies, searchValue, filter]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventory" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <Heading title="Inventory" description="Track supplies and materials" />
                    <div className="flex space-x-2">
                        <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
                            <DialogTrigger asChild>
                                <Button variant="highlight">+ Add Item</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Add <span className="text-highlight font-bold">Item</span></DialogTitle>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Record a new inventory item.</p>
                                </DialogHeader>

                                <div className="flex flex-col gap-3">
                                    <div>
                                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Item Name</label>
                                        <Input
                                            placeholder="Item Name"
                                            value={newItem.supply_name}
                                            onChange={(e) => setNewItem({ ...newItem, supply_name: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Unit</label>
                                        <Input
                                            placeholder="Unit"
                                            value={newItem.unit}
                                            onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Reorder Level</label>
                                        <Input
                                            type="number"
                                            placeholder="Reorder Level"
                                            value={newItem.reorder_point}
                                            onChange={(e) => setNewItem({ ...newItem, reorder_point: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button variant="secondary" onClick={handleCancelAddItem}>Cancel</Button>
                                    <Button variant="highlight" onClick={handleAddItem}>Save</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                            <DialogContent className="sm:max-w-sm w-full rounded-xl p-6 shadow-lg">
                                <DialogHeader>
                                    <DialogTitle>Confirm Action</DialogTitle>
                                </DialogHeader>
                                <p className="text-center text-gray-600 my-4">{confirmMessage}</p>
                                <DialogFooter className="flex justify-end gap-3">
                                    <Button variant="secondary" onClick={() => setConfirmOpen(false)}>No</Button>
                                    <Button variant="highlight" onClick={handleConfirm}>Yes</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={showAddPurchase} onOpenChange={setShowAddPurchase}>
                            <DialogTrigger asChild>
                                <Button variant="highlight">+ Add Purchase</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Add <span className="text-highlight font-bold">Purchase</span></DialogTitle>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                        Record a new inventory purchase from a supplier.
                                    </p>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button variant="secondary" onClick={()=> setShowAddPurchase(false)}>Cancel</Button>
                                    <Button variant="highlight" onClick={() => setShowAddPurchase(false)}>Save</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={showExportReport} onOpenChange={setShowExportReport}>
                            <DialogTrigger asChild>
                                <Button variant="highlight">+ Export Report</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Export <span className="text-highlight font-bold">Report</span></DialogTitle>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button variant="secondary" onClick={() => setShowExportReport(false)}>Cancel</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <Card className="border border-sidebar-border/70 bg-white dark:bg-neutral-900">
                    <CardContent className="flex flex-col gap-4 p-4">
                        <div className="flex items-center justify-between gap-4">
                            <h2 className="text-lg font-semibold text-neutral-800 dark:text-white">Search Supplies</h2>
                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center justify-between rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                                    {filter} <ChevronDownIcon className="ml-2 h-4 w-4 text-neutral-500" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-40">
                                    {['All', 'Item', 'Unit', 'Status'].map((f) => (
                                        <DropdownMenuItem key={f} onClick={() => setFilter(f as typeof filter)}> {f} </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                            <Input placeholder="Search..." value={searchValue} onChange={(e) => setSearchValue(e.target.value)}
                                className="border-neutral-300 bg-white pl-10 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white w-full"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-sidebar-border/70 bg-white dark:bg-neutral-900">
                    <CardContent className="p-4">
                        <div className="mb-4 flex flex-col gap-1">
                            <h2 className="font-semibold text-neutral-800 dark:text-white">Supply List</h2>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Supplies: {filteredSupplies.length}</p>
                        </div>

                        {filteredSupplies.length === 0 ? (
                            <div className="py-12 text-center text-neutral-500 dark:text-neutral-400">
                                <p>No supplies matched your search or filter.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700">
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
                                        {filteredSupplies.map((supply, index) => {
                                            let status = supply.quantity_stock <= supply.reorder_point ? 'Low Stock' : 'In Stock';
                                            let variant: 'success' | 'warning' = status === 'Low Stock' ? 'warning' : 'success';

                                            return (
                                                <TableRow key={index} className={cn(
                                                    index % 2 === 0
                                                        ? 'bg-white dark:bg-neutral-900'
                                                        : 'bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700',
                                                    'text-neutral-900 dark:text-white'
                                                )}>
                                                    <TableCell>{supply.supply_name}</TableCell>
                                                    <TableCell>{supply.quantity_stock}</TableCell>
                                                    <TableCell>{supply.unit}</TableCell>
                                                    <TableCell>{supply.reorder_point}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={variant}>{status}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                setEditItem({ ...supply });
                                                                setShowEditModal(true);
                                                            }}
                                                        >
                                                            <Edit2 className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
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

                <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Edit <span className="text-highlight font-bold">Item</span></DialogTitle>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                Edit inventory item details. Status is auto-calculated.
                            </p>
                        </DialogHeader>

                        <div className="flex flex-col gap-3">
                            <div>
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Item Name</label>
                                <Input
                                    placeholder="Item Name"
                                    value={editItem?.supply_name || ''}
                                    onChange={(e) => setEditItem(prev => prev ? { ...prev, supply_name: e.target.value } : prev)}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Unit</label>
                                <Input
                                    placeholder="Unit"
                                    value={editItem?.unit || ''}
                                    onChange={(e) => setEditItem(prev => prev ? { ...prev, unit: e.target.value } : prev)}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Quantity Stock</label>
                                <Input
                                    type="number"
                                    placeholder="Quantity Stock"
                                    value={editItem?.quantity_stock || 0}
                                    onChange={(e) => setEditItem(prev => prev ? { ...prev, quantity_stock: parseInt(e.target.value) || 0 } : prev)}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Reorder Level</label>
                                <Input
                                    type="number"
                                    placeholder="Reorder Level"
                                    value={editItem?.reorder_point || 0}
                                    onChange={(e) => setEditItem(prev => prev ? { ...prev, reorder_point: parseInt(e.target.value) || 0 } : prev)}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
                            <Button variant="highlight" onClick={handleSaveEdit}>Save</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
