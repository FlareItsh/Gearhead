import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import axios from 'axios';
import { Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Supply {
    supply_id: number;
    supply_name: string;
    unit: string;
    quantity_stock: number;
    supply_type: 'consumables' | 'supply';
}

interface ServiceOrder {
    service_order_detail_id: number;
    service_order_id: number;
    service_name: string;
    employee_name: string;
    employee_id: number;
    order_date: string;
}

interface PulloutDetail {
    supply_id: number;
    quantity: number;
}

interface PulloutRequestModalProps {
    supplies: Supply[];
    onSuccess?: () => void;
}

export default function PulloutRequestModal({
    supplies,
    onSuccess,
}: PulloutRequestModalProps) {
    const [open, setOpen] = useState(false);
    const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
    const [selectedServiceOrder, setSelectedServiceOrder] = useState('');
    const [pulloutDetails, setPulloutDetails] = useState<PulloutDetail[]>([]);
    const [newDetail, setNewDetail] = useState<PulloutDetail>({
        supply_id: 0,
        quantity: 0,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [supplySearch, setSupplySearch] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (open) {
            loadServiceOrders();
        }
    }, [open]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const loadServiceOrders = async () => {
        try {
            const response = await axios.get('/pullout-requests');
            setServiceOrders(response.data.activeServiceOrders || []);
        } catch (error) {
            console.error('Failed to load service orders:', error);
        }
    };

    const handleAddDetail = () => {
        const validationErrors: Record<string, string> = {};

        if (!newDetail.supply_id) {
            validationErrors.supply = 'Please select a supply';
        }
        if (newDetail.quantity <= 0) {
            validationErrors.quantity = 'Quantity must be greater than 0';
        }

        const selectedSupply = supplies.find(
            (s) => s.supply_id === newDetail.supply_id,
        );
        if (
            selectedSupply &&
            newDetail.quantity > selectedSupply.quantity_stock
        ) {
            validationErrors.quantity = `Only ${selectedSupply.quantity_stock} available`;
        }

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        setPulloutDetails([...pulloutDetails, { ...newDetail }]);
        setNewDetail({ supply_id: 0, quantity: 0 });
        setSupplySearch('');
        setErrors({});
    };

    const handleRemoveDetail = (index: number) => {
        setPulloutDetails(pulloutDetails.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        const validationErrors: Record<string, string> = {};

        if (!selectedServiceOrder) {
            validationErrors.serviceOrder = 'Please select a service order';
        }
        if (pulloutDetails.length === 0) {
            validationErrors.details = 'Please add at least one supply';
        }

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        setLoading(true);

        try {
            const selectedOrder = serviceOrders.find(
                (so) =>
                    so.service_order_detail_id.toString() ===
                    selectedServiceOrder,
            );

            if (!selectedOrder) {
                throw new Error('Service order not found');
            }

            await axios.post('/pullout-requests', {
                employee_id: selectedOrder.employee_id,
                service_order_detail_id: selectedOrder.service_order_detail_id,
                supplies: pulloutDetails,
            });

            setOpen(false);
            setSelectedServiceOrder('');
            setPulloutDetails([]);
            setNewDetail({ supply_id: 0, quantity: 0 });
            setErrors({});

            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error('Failed to create pullout request:', error);
            const err = error as { response?: { data?: { message?: string } } };
            setErrors({
                submit:
                    err.response?.data?.message ||
                    'Failed to create pullout request',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="highlight">+ Pullout Request</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Create Pullout Request</DialogTitle>
                    <DialogDescription>
                        Request supplies for a service order
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">
                            Service Order
                        </label>
                        <Select
                            value={selectedServiceOrder}
                            onValueChange={setSelectedServiceOrder}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Choose service order..." />
                            </SelectTrigger>
                            <SelectContent>
                                {serviceOrders.map((so) => (
                                    <SelectItem
                                        key={so.service_order_detail_id}
                                        value={so.service_order_detail_id.toString()}
                                    >
                                        {so.service_name} - {so.employee_name} (
                                        {so.order_date})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.serviceOrder && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.serviceOrder}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium">
                            Add Supplies
                        </label>
                        <div className="mt-3 rounded-lg border bg-muted/30 p-4">
                            <div className="grid grid-cols-2 gap-3">
                                {/* SUPPLY */}
                                <div ref={inputRef} className="relative w-full">
                                    <label className="text-xs font-medium">
                                        Supply
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="Search supply..."
                                        className="h-9"
                                        value={supplySearch}
                                        onChange={(e) => {
                                            setSupplySearch(e.target.value);
                                            setShowSuggestions(true);
                                            setNewDetail({
                                                ...newDetail,
                                                supply_id: 0,
                                            });
                                        }}
                                        onFocus={() => setShowSuggestions(true)}
                                    />
                                    {showSuggestions && supplySearch && (
                                        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-background shadow-lg">
                                            {supplies
                                                .filter(
                                                    (s) =>
                                                        s.quantity_stock > 0 &&
                                                        s.supply_name
                                                            .toLowerCase()
                                                            .includes(
                                                                supplySearch.toLowerCase(),
                                                            ),
                                                )
                                                .map((supply) => (
                                                    <button
                                                        key={supply.supply_id}
                                                        type="button"
                                                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                                                        onClick={() => {
                                                            setNewDetail({
                                                                ...newDetail,
                                                                supply_id:
                                                                    supply.supply_id,
                                                            });
                                                            setSupplySearch(
                                                                supply.supply_name,
                                                            );
                                                            setShowSuggestions(
                                                                false,
                                                            );
                                                        }}
                                                    >
                                                        {supply.supply_name} (
                                                        {supply.quantity_stock}{' '}
                                                        {supply.unit} available)
                                                    </button>
                                                ))}
                                            {supplies.filter(
                                                (s) =>
                                                    s.quantity_stock > 0 &&
                                                    s.supply_name
                                                        .toLowerCase()
                                                        .includes(
                                                            supplySearch.toLowerCase(),
                                                        ),
                                            ).length === 0 && (
                                                <div className="px-3 py-2 text-sm text-muted-foreground">
                                                    No supplies found
                                                </div>
                                            )}
                                        </div>
                                    )}
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
                                            newDetail.quantity === 0
                                                ? ''
                                                : newDetail.quantity
                                        }
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (
                                                val === '' ||
                                                parseInt(val) >= 0
                                            ) {
                                                setNewDetail({
                                                    ...newDetail,
                                                    quantity:
                                                        val === ''
                                                            ? 0
                                                            : parseInt(val),
                                                });
                                            }
                                        }}
                                        onKeyDown={(e) =>
                                            ['-', 'e', 'E', '.'].includes(
                                                e.key,
                                            ) && e.preventDefault()
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
                        {errors.supply && (
                            <p className="mt-2 text-sm text-red-500">
                                {errors.supply}
                            </p>
                        )}
                        {errors.quantity && (
                            <p className="mt-2 text-sm text-red-500">
                                {errors.quantity}
                            </p>
                        )}

                        {pulloutDetails.length > 0 && (
                            <div className="mt-4 max-h-64 overflow-y-auto rounded border">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="px-3 py-2 text-left">
                                                Supply
                                            </th>
                                            <th className="px-3 py-2 text-center">
                                                Qty
                                            </th>
                                            <th className="px-3 py-2 text-center"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pulloutDetails.map((detail, i) => {
                                            const supply = supplies.find(
                                                (s) =>
                                                    s.supply_id ===
                                                    detail.supply_id,
                                            );
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
                                                        {detail.quantity}{' '}
                                                        {supply?.unit || ''}
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
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    {errors.details && (
                        <p className="text-sm text-red-500">{errors.details}</p>
                    )}
                    {errors.submit && (
                        <p className="text-sm text-red-500">{errors.submit}</p>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setOpen(false);
                            setSelectedServiceOrder('');
                            setPulloutDetails([]);
                            setNewDetail({ supply_id: 0, quantity: 0 });
                            setSupplySearch('');
                            setShowSuggestions(false);
                            setErrors({});
                        }}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="highlight"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'Submitting...' : 'Submit Request'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
