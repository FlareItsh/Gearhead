import Heading from '@/components/heading';
import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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

import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import axios from 'axios';
import { Clock, Pencil, Plus, Search } from 'lucide-react';
import { useState } from 'react';

// Configure axios to send cookies with requests
axios.defaults.withCredentials = true;

const breadcrumbs = [{ title: 'Services', href: '/services' }];

interface Service {
    service_id: number;
    service_name: string;
    description: string;
    estimated_duration: number;
    price: number;
    size: string;
    category: string;
    status: string;
}

interface ServicesProps {
    services: Service[];
    categories: string[];
}

export default function AdminServices({
    services = [],
    categories = [],
}: ServicesProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const { data, setData, processing, reset } = useForm({
        service_name: '',
        description: '',
        size: '',
        category: '',
        estimated_duration: '',
        price: '',
        status: 'active',
    });

    const filteredServices = services
        .filter((s) => {
            const matchesCategory =
                selectedCategory === 'All' || s.category === selectedCategory;
            const matchesSearch =
                searchQuery === '' ||
                s.service_name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                s.description
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.size.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        })
        .sort((a, b) => {
            // Size order mapping: Small < Medium < Large < X-Large < XX-Large
            const sizeOrder: Record<string, number> = {
                Small: 1,
                Medium: 2,
                Large: 3,
                'X-Large': 4,
                'XX-Large': 5,
            };

            // First sort by category alphabetically
            const categoryCompare = a.category.localeCompare(b.category);
            if (categoryCompare !== 0) {
                return categoryCompare;
            }

            // Then sort by size order
            const sizeA = sizeOrder[a.size] || 999;
            const sizeB = sizeOrder[b.size] || 999;
            return sizeA - sizeB;
        });

    const handleEdit = (service: Service) => {
        setEditingService(service);
        setData({
            service_name: service.service_name,
            description: service.description,
            size: service.size,
            category: service.category,
            estimated_duration: service.estimated_duration.toString(),
            price: service.price.toString(),
            status: service.status,
        });
        setErrors({});
        setShowModal(true);
    };

    const handleAddNew = () => {
        setEditingService(null);
        reset();
        setErrors({});
        setShowModal(true);
    };

    const validateFields = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!data.service_name.trim()) {
            newErrors.service_name = 'Service name is required';
        }
        if (!data.description.trim()) {
            newErrors.description = 'Description is required';
        }
        if (!data.category) {
            newErrors.category = 'Category is required';
        }
        if (!data.size) {
            newErrors.size = 'Size is required';
        }
        if (
            !data.estimated_duration ||
            parseFloat(data.estimated_duration) <= 0
        ) {
            newErrors.estimated_duration = 'Duration must be greater than 0';
        }
        if (!data.price || parseFloat(data.price) <= 0) {
            newErrors.price = 'Price must be greater than 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateFields()) {
            return;
        }

        try {
            const config = {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content'),
                },
            };

            console.log('Submitting with data:', data);

            if (editingService) {
                console.log(`Updating service ${editingService.service_id}`);
                await axios.put(
                    `/api/services/${editingService.service_id}`,
                    data,
                    config,
                );
                setSuccessMessage('Service updated successfully!');
            } else {
                console.log('Creating new service');
                await axios.post('/api/services', data, config);
                setSuccessMessage('Service created successfully!');
            }
            setShowModal(false);
            reset();
            setShowSuccessModal(true);
            // Reload the page after a short delay to get updated services
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error) {
            console.error('Full error:', error);
            if (axios.isAxiosError(error)) {
                console.error('Response status:', error.response?.status);
                console.error('Response data:', error.response?.data);
            }
            alert(
                'Error submitting service: ' +
                    (axios.isAxiosError(error)
                        ? error.response?.data?.message || error.message
                        : 'Unknown error'),
            );
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Services Management" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Heading
                        title="Services"
                        description="Manage carwash services and pricing"
                    />
                    <Button variant="highlight" onClick={handleAddNew}>
                        <Plus className="h-4 w-4" />
                        Add Service
                    </Button>
                </div>

                {/* Search Bar */}
                <div className="flex flex-col gap-4 rounded-lg border border-border bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:bg-black">
                    <div className="flex flex-1 items-center gap-3">
                        <Search className="h-5 w-5 text-foreground" />
                        <Input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 border-none bg-transparent text-foreground shadow-none focus-visible:ring-0"
                        />
                    </div>
                    <Select
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                    >
                        <SelectTrigger className="mt-2 w-full sm:mt-0 sm:w-[180px]">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All" className="font-bold">
                                All
                            </SelectItem>
                            {categories.map((cat) => (
                                <SelectItem
                                    key={cat}
                                    value={cat}
                                    className="font-bold"
                                >
                                    {cat}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Category Filters */}
                <div className="custom-scrollbar flex w-full gap-4 overflow-x-auto">
                    <Button
                        className="text-lg font-bold"
                        variant={
                            selectedCategory === 'All' ? 'highlight' : 'default'
                        }
                        onClick={() => setSelectedCategory('All')}
                    >
                        All
                    </Button>

                    {categories.map((cat) => {
                        const isActive = cat === selectedCategory;
                        return (
                            <Button
                                key={cat}
                                className="text-lg font-bold"
                                variant={isActive ? 'highlight' : 'default'}
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat}
                            </Button>
                        );
                    })}
                </div>

                {/* Services List */}
                <div className="p-2">
                    <h4 className="mb-2 text-2xl font-bold">
                        {selectedCategory}
                    </h4>

                    <div className="custom-scrollbar max-h-[60vh] overflow-y-auto">
                        {filteredServices.length > 0 ? (
                            <div className="flex flex-wrap justify-center gap-4">
                                {filteredServices.map((s) => (
                                    <div
                                        key={s.service_id}
                                        className={`flex w-sm flex-col justify-between gap-5 rounded-sm border p-4 ${
                                            s.status === 'inactive'
                                                ? 'opacity-50'
                                                : ''
                                        }`}
                                    >
                                        <div
                                            className={
                                                s.status === 'inactive'
                                                    ? 'relative'
                                                    : ''
                                            }
                                        >
                                            {s.status === 'inactive' && (
                                                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-sm bg-highlight/60">
                                                    <span className="text-lg font-bold text-red-500">
                                                        INACTIVE
                                                    </span>
                                                </div>
                                            )}
                                            <HeadingSmall
                                                title={`${s.service_name}`}
                                                description={s.description
                                                    .replace(/,\s*/g, ', ')
                                                    .split(', ')
                                                    .map(
                                                        (w) =>
                                                            w
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                            w
                                                                .slice(1)
                                                                .toLowerCase(),
                                                    )
                                                    .join(', ')}
                                            />
                                        </div>
                                        <div className="flex justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                <span>
                                                    {s.estimated_duration} mins
                                                </span>
                                            </div>
                                            <p className="font-bold">
                                                ₱{s.price.toLocaleString()}
                                            </p>
                                        </div>
                                        <hr className="border-gray-400/50" />
                                        <span>
                                            Car Size: <strong>{s.size}</strong>
                                        </span>

                                        <Button
                                            variant="highlight"
                                            className="mt-4 w-full"
                                            onClick={() => handleEdit(s)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                            Edit
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">
                                No services available.
                            </p>
                        )}
                    </div>
                </div>

                {/* Modal */}
                <Dialog open={showModal} onOpenChange={setShowModal}>
                    <DialogContent className="w-full sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>
                                {editingService ? (
                                    <>
                                        Edit{' '}
                                        <span className="text-yellow-400">
                                            Service
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        Add{' '}
                                        <span className="text-yellow-400">
                                            Service
                                        </span>
                                    </>
                                )}
                            </DialogTitle>
                            <DialogDescription>
                                {editingService
                                    ? `Editing: ${editingService.service_name} - ${editingService.size}`
                                    : 'Create a new service offering'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="service_name">
                                        Service Name
                                    </Label>
                                    <Input
                                        id="service_name"
                                        value={data.service_name}
                                        onChange={(e) =>
                                            setData(
                                                'service_name',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    {errors.service_name && (
                                        <p className="text-sm text-red-500">
                                            {errors.service_name}
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="description">
                                        Description
                                    </Label>
                                    <textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) =>
                                            setData(
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                        rows={3}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-red-500">
                                            {errors.description}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="size">Size</Label>
                                        <Select
                                            value={data.size}
                                            onValueChange={(value) =>
                                                setData('size', value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select size" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[
                                                    'Small',
                                                    'Medium',
                                                    'Large',
                                                    'X-Large',
                                                    'XX-Large',
                                                ].map((sz) => (
                                                    <SelectItem
                                                        key={sz}
                                                        value={sz}
                                                        className="font-bold"
                                                    >
                                                        {sz}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.size && (
                                            <p className="text-sm text-red-500">
                                                {errors.size}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="category">
                                            Category
                                        </Label>
                                        <Select
                                            value={data.category}
                                            onValueChange={(value) =>
                                                setData('category', value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem
                                                        key={cat}
                                                        value={cat}
                                                        className="font-bold"
                                                    >
                                                        {cat}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.category && (
                                            <p className="text-sm text-red-500">
                                                {errors.category}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="estimated_duration">
                                            Duration (mins)
                                        </Label>
                                        <Input
                                            id="estimated_duration"
                                            type="number"
                                            value={data.estimated_duration}
                                            onChange={(e) =>
                                                setData(
                                                    'estimated_duration',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        {errors.estimated_duration && (
                                            <p className="text-sm text-red-500">
                                                {errors.estimated_duration}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="price">Price (₱)</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            step="0.01"
                                            value={data.price}
                                            onChange={(e) =>
                                                setData('price', e.target.value)
                                            }
                                        />
                                        {errors.price && (
                                            <p className="text-sm text-red-500">
                                                {errors.price}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(value) =>
                                            setData('status', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">
                                                Active
                                            </SelectItem>
                                            <SelectItem value="inactive">
                                                Inactive
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="highlight"
                                disabled={processing}
                                onClick={handleSubmit}
                            >
                                {editingService
                                    ? 'Update Service'
                                    : 'Create Service'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Success Modal */}
                <Dialog
                    open={showSuccessModal}
                    onOpenChange={setShowSuccessModal}
                >
                    <DialogContent className="w-full rounded-xl p-6 shadow-lg sm:max-w-sm">
                        <DialogHeader>
                            <DialogTitle className="text-highlight">
                                ✓ Success
                            </DialogTitle>
                        </DialogHeader>
                        <p className="my-4 text-center text-foreground">
                            {successMessage}
                        </p>
                        <DialogFooter className="flex justify-end gap-3">
                            <Button
                                variant="highlight"
                                onClick={() => setShowSuccessModal(false)}
                                className="w-full"
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
