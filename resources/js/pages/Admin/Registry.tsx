import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';

axios.defaults.withCredentials = true;

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Registry', href: '/registry' },
];

interface Bay {
    bay_id: number;
    bay_number: number;
    status: 'available' | 'occupied' | 'maintenance';
    bay_type: 'Normal' | 'Underwash';
    created_at?: string;
    updated_at?: string;
}

interface Service {
    service_id: number;
    service_name: string;
    category: string;
    size: string;
    price: number;
    estimated_duration: number;
}

interface Customer {
    user_id: number;
    first_name: string;
    last_name: string;
    email?: string;
    phone_number?: string;
}

export default function Registry() {
    const [bays, setBays] = useState<Bay[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

    // Service selection modal state
    const [serviceModalOpen, setServiceModalOpen] = useState(false);
    const [selectedBay, setSelectedBay] = useState<Bay | null>(null);
    const [selectedServices, setSelectedServices] = useState<Service[]>([]);

    // Customer selection modal state
    const [customerModalOpen, setCustomerModalOpen] = useState(false);
    const [customerSearch, setCustomerSearch] = useState('');
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    const [isNewCustomer, setIsNewCustomer] = useState(false);
    const [newCustomerForm, setNewCustomerForm] = useState({
        first_name: '',
        last_name: '',
        phone_number: '',
        address: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadBays();
        loadServices();
        loadCustomers();
    }, []);

    useEffect(() => {
        if (customerSearch.trim()) {
            const search = customerSearch.toLowerCase();
            const filtered = customers.filter(
                (c) =>
                    `${c.first_name} ${c.last_name}`
                        .toLowerCase()
                        .includes(search) ||
                    c.phone_number?.includes(customerSearch),
            );
            setFilteredCustomers(filtered);
        } else {
            setFilteredCustomers([]);
        }
    }, [customerSearch, customers]);

    const loadBays = async () => {
        try {
            const res = await axios.get('/bays/list');
            setBays(res.data);
        } catch (err) {
            console.error('Failed to fetch bays:', err);
        }
    };

    const loadServices = async () => {
        try {
            const res = await axios.get('/services/list');
            setServices(res.data);
        } catch (err) {
            console.error('Failed to fetch services:', err);
        }
    };

    const loadCustomers = async () => {
        try {
            const res = await axios.get('/customers/list');
            setCustomers(res.data);
        } catch (err) {
            console.error('Failed to fetch customers:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBayClick = (bay: Bay) => {
        setSelectedBay(bay);
        setSelectedServices([]);
        setServiceModalOpen(true);
    };

    const handleServiceToggle = (service: Service) => {
        setSelectedServices((prev) => {
            const exists = prev.some((s) => s.service_id === service.service_id);
            if (exists) {
                return prev.filter((s) => s.service_id !== service.service_id);
            } else {
                return [...prev, service];
            }
        });
    };

    const handleServiceConfirm = () => {
        if (selectedServices.length === 0) {
            setError('Please select at least one service');
            return;
        }
        setServiceModalOpen(false);
        setCustomerModalOpen(true);
        setError('');
    };

    const handleSelectExistingCustomer = (customer: Customer) => {
        setIsNewCustomer(false);
        setCustomerSearch('');
        proceedToPayment(customer);
    };

    const handleCreateCustomer = async () => {
        if (
            !newCustomerForm.first_name.trim() ||
            !newCustomerForm.last_name.trim()
        ) {
            setError('First name and last name are required');
            return;
        }

        try {
            setSubmitting(true);
            const generatedPassword = `${newCustomerForm.last_name}${newCustomerForm.first_name}12345`;

            const res = await axios.post('/customers/create', {
                first_name: newCustomerForm.first_name,
                last_name: newCustomerForm.last_name,
                phone_number: newCustomerForm.phone_number || null,
                address: newCustomerForm.address || null,
                email: null,
                password: generatedPassword,
            });

            const newCustomer: Customer = res.data;
            setIsNewCustomer(true);
            setError('');
            proceedToPayment(newCustomer);
        } catch (err) {
            console.error('Failed to create customer:', err);
            setError('Failed to create customer');
        } finally {
            setSubmitting(false);
        }
    };

    const proceedToPayment = (customer: Customer) => {
        if (!selectedBay || selectedServices.length === 0) return;

        const serviceIds = selectedServices.map((s) => s.service_id).join(',');
        router.visit(
            `/registry/${selectedBay.bay_id}/payment?customer_id=${customer.user_id}&services=${serviceIds}`,
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleFinish = (bayId: number) => {
        router.visit(`/registry/${bayId}/payment`, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'available':
                return 'success';
            case 'occupied':
                return 'warning';
            case 'maintenance':
                return 'destructive';
            default:
                return 'default';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'available':
                return 'Available';
            case 'occupied':
                return 'Occupied';
            case 'maintenance':
                return 'Under Maintenance';
            default:
                return status;
        }
    };

    const getTotalPrice = () => {
        return selectedServices.reduce((sum, service) => sum + service.price, 0);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Registry" />
            <div className="flex flex-col gap-6 p-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Registry
                    </h1>
                    <p className="text-muted-foreground">
                        Manage and monitor bays for carwash services
                    </p>
                </div>

                {loading ? (
                    <div className="py-12 text-center text-muted-foreground">
                        Loading bays...
                    </div>
                ) : bays.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                        No bays found.
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {bays.map((bay) => {
                            const isAvailable = bay.status === 'available';
                            const isOccupied = bay.status === 'occupied';
                            const isMaintenance = bay.status === 'maintenance';

                            return (
                                <Card
                                    key={bay.bay_id}
                                    className={cn(
                                        'group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-xl',
                                        isAvailable &&
                                            'border-green-200/50 bg-green-50/30 dark:border-green-900/50 dark:bg-green-950/20 cursor-pointer hover:border-green-300/70 dark:hover:border-green-800/70',
                                        isOccupied &&
                                            'border-orange-200/50 bg-orange-50/40 dark:border-orange-900/50 dark:bg-orange-950/30',
                                        isMaintenance &&
                                            'border-red-200/50 bg-red-50/40 dark:border-red-900/50 dark:bg-red-950/30',
                                    )}
                                    onClick={() =>
                                        isAvailable && handleBayClick(bay)
                                    }
                                >
                                    {/* Status accent border */}
                                    <div
                                        className={cn(
                                            'absolute inset-x-0 top-0 h-1 transition-all duration-500',
                                            isAvailable &&
                                                'bg-gradient-to-r from-green-400 to-emerald-500',
                                            isOccupied &&
                                                'bg-gradient-to-r from-orange-400 to-amber-500',
                                            isMaintenance &&
                                                'bg-gradient-to-r from-red-500 to-rose-600',
                                        )}
                                    />

                                    <CardContent className="px-10 py-5">
                                        <div className="mb-5 flex items-start justify-between">
                                            <div>
                                                <h3 className="text-2xl font-bold tracking-tight text-foreground">
                                                    Bay #{bay.bay_number}
                                                </h3>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {bay.bay_type ===
                                                    'Underwash'
                                                        ? 'Underwash Bay'
                                                        : 'Standard Bay'}
                                                </p>
                                            </div>

                                            {/* Status Badge */}
                                            <Badge
                                                variant={getStatusVariant(
                                                    bay.status,
                                                )}
                                            >
                                                {getStatusLabel(bay.status)}
                                            </Badge>
                                        </div>

                                        {/* Action Buttons */}
                                        {isAvailable && (
                                            <div className="mt-6">
                                                <Button
                                                    onClick={() =>
                                                        handleBayClick(bay)
                                                    }
                                                    variant="highlight"
                                                    className="h-11 w-full font-medium"
                                                >
                                                    Start Service
                                                </Button>
                                            </div>
                                        )}
                                        {!isAvailable && (
                                            <div className="mt-6">
                                                <Button
                                                    onClick={() =>
                                                        handleFinish(
                                                            bay.bay_id,
                                                        )
                                                    }
                                                    variant="highlight"
                                                    className="h-11 w-full font-medium"
                                                >
                                                    Finish Service
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Service Selection Modal */}
            {serviceModalOpen && selectedBay && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs">
                    <div className="relative mx-4 w-full max-w-2xl transform rounded-xl border border-border bg-background p-6 shadow-2xl">
                        {/* Close Button */}
                        <button
                            className="absolute top-4 right-4 rounded-full p-2 transition-colors duration-200 hover:bg-muted/50"
                            onClick={() => setServiceModalOpen(false)}
                        >
                            <X className="h-5 w-5 text-muted-foreground" />
                        </button>

                        <h2 className="mb-6 text-2xl font-bold">
                            Select Services for Bay #{selectedBay.bay_number}
                        </h2>

                        {error && (
                            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/20">
                                {error}
                            </div>
                        )}

                        {/* Services Grid */}
                        <div className="mb-6 max-h-96 overflow-y-auto">
                            <div className="grid gap-3">
                                {services.map((service) => {
                                    const isSelected = selectedServices.some(
                                        (s) =>
                                            s.service_id === service.service_id,
                                    );
                                    return (
                                        <div
                                            key={service.service_id}
                                            onClick={() =>
                                                handleServiceToggle(service)
                                            }
                                            className={cn(
                                                'flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-all duration-200',
                                                isSelected
                                                    ? 'border-highlight bg-highlight/10'
                                                    : 'border-border/50 hover:border-border',
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    'flex h-5 w-5 items-center justify-center rounded border',
                                                    isSelected
                                                        ? 'border-highlight bg-highlight'
                                                        : 'border-border',
                                                )}
                                            >
                                                {isSelected && (
                                                    <Check className="h-4 w-4 text-white" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-foreground">
                                                    {service.service_name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {service.category} •{' '}
                                                    {service.size} •{' '}
                                                    {service.estimated_duration}{' '}
                                                    min
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-foreground">
                                                    ₱{service.price.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="mb-6 rounded-lg bg-muted/50 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Selected Services
                                    </p>
                                    <p className="text-lg font-semibold">
                                        {selectedServices.length} service
                                        {selectedServices.length !== 1
                                            ? 's'
                                            : ''}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Total
                                    </p>
                                    <p className="text-2xl font-bold text-highlight">
                                        ₱{getTotalPrice().toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setServiceModalOpen(false)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="highlight"
                                onClick={handleServiceConfirm}
                                className="flex-1"
                            >
                                Continue to Customer
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Customer Selection Modal */}
            {customerModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs">
                    <div className="relative mx-4 w-full max-w-2xl transform rounded-xl border border-border bg-background p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        {/* Close Button */}
                        <button
                            className="absolute top-4 right-4 rounded-full p-2 transition-colors duration-200 hover:bg-muted/50"
                            onClick={() => {
                                setCustomerModalOpen(false);
                                setServiceModalOpen(true);
                                setIsNewCustomer(false);
                                setCustomerSearch('');
                                setNewCustomerForm({
                                    first_name: '',
                                    last_name: '',
                                    phone_number: '',
                                    address: '',
                                });
                            }}
                        >
                            <X className="h-5 w-5 text-muted-foreground" />
                        </button>

                        {!isNewCustomer ? (
                            <>
                                <h2 className="mb-6 text-2xl font-bold">
                                    Select Customer
                                </h2>

                                {error && (
                                    <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/20">
                                        {error}
                                    </div>
                                )}

                                {/* Customer Search */}
                                <div className="mb-6">
                                    <Label className="mb-2 block">
                                        Search Customer
                                    </Label>
                                    <Input
                                        type="text"
                                        placeholder="Enter name or phone number..."
                                        value={customerSearch}
                                        onChange={(e) =>
                                            setCustomerSearch(e.target.value)
                                        }
                                        className="mb-3"
                                    />

                                    {/* Filtered Customers List */}
                                    {customerSearch.trim() && (
                                        <div className="mb-4 max-h-64 overflow-y-auto rounded-lg border border-border/50">
                                            {filteredCustomers.length > 0 ? (
                                                filteredCustomers.map(
                                                    (customer) => (
                                                        <button
                                                            key={customer.user_id}
                                                            onClick={() =>
                                                                handleSelectExistingCustomer(
                                                                    customer,
                                                                )
                                                            }
                                                            className="w-full border-b border-border/50 p-3 text-left transition-colors duration-200 hover:bg-muted/50 last:border-0"
                                                        >
                                                            <p className="font-medium text-foreground">
                                                                {customer.first_name}{' '}
                                                                {customer.last_name}
                                                            </p>
                                                            {customer.phone_number && (
                                                                <p className="text-sm text-muted-foreground">
                                                                    {customer.phone_number}
                                                                </p>
                                                            )}
                                                        </button>
                                                    ),
                                                )
                                            ) : (
                                                <div className="p-4 text-center text-sm text-muted-foreground">
                                                    No customers found
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Or Divider */}
                                <div className="relative mb-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-border/50" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="bg-background px-2 text-muted-foreground">
                                            or
                                        </span>
                                    </div>
                                </div>

                                {/* Create New Customer Button */}
                                <Button
                                    variant="outline"
                                    onClick={() => setIsNewCustomer(true)}
                                    className="w-full"
                                >
                                    Create New Customer
                                </Button>
                            </>
                        ) : (
                            <>
                                <h2 className="mb-6 text-2xl font-bold">
                                    Create New Customer
                                </h2>

                                {error && (
                                    <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/20">
                                        {error}
                                    </div>
                                )}

                                {/* New Customer Form */}
                                <div className="space-y-4">
                                    {/* First Name */}
                                    <div>
                                        <Label className="mb-2 block">
                                            First Name *
                                        </Label>
                                        <Input
                                            type="text"
                                            placeholder="Enter first name"
                                            value={newCustomerForm.first_name}
                                            onChange={(e) =>
                                                setNewCustomerForm({
                                                    ...newCustomerForm,
                                                    first_name: e.target.value,
                                                })
                                            }
                                        />
                                    </div>

                                    {/* Last Name */}
                                    <div>
                                        <Label className="mb-2 block">
                                            Last Name *
                                        </Label>
                                        <Input
                                            type="text"
                                            placeholder="Enter last name"
                                            value={newCustomerForm.last_name}
                                            onChange={(e) =>
                                                setNewCustomerForm({
                                                    ...newCustomerForm,
                                                    last_name: e.target.value,
                                                })
                                            }
                                        />
                                    </div>

                                    {/* Phone Number */}
                                    <div>
                                        <Label className="mb-2 block">
                                            Phone Number (Optional)
                                        </Label>
                                        <Input
                                            type="tel"
                                            placeholder="Enter phone number"
                                            value={newCustomerForm.phone_number}
                                            onChange={(e) =>
                                                setNewCustomerForm({
                                                    ...newCustomerForm,
                                                    phone_number: e.target.value,
                                                })
                                            }
                                        />
                                    </div>

                                    {/* Address */}
                                    <div>
                                        <Label className="mb-2 block">
                                            Address (Optional)
                                        </Label>
                                        <Input
                                            type="text"
                                            placeholder="Enter address"
                                            value={newCustomerForm.address}
                                            onChange={(e) =>
                                                setNewCustomerForm({
                                                    ...newCustomerForm,
                                                    address: e.target.value,
                                                })
                                            }
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-600 dark:bg-blue-950/20">
                                        A temporary account will be created with
                                        password:{' '}
                                        <code className="font-mono font-semibold">
                                            {newCustomerForm.last_name}
                                            {newCustomerForm.first_name}
                                            12345
                                        </code>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-6 flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsNewCustomer(false)}
                                        className="flex-1"
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        variant="highlight"
                                        onClick={handleCreateCustomer}
                                        disabled={submitting}
                                        className="flex-1"
                                    >
                                        {submitting
                                            ? 'Creating...'
                                            : 'Create & Continue'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
