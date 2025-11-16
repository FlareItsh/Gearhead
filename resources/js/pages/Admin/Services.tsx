import Heading from '@/components/heading';
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
import { Head, router, useForm } from '@inertiajs/react';
import { Clock, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

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

    const { data, setData, post, put, processing, errors, reset } = useForm({
        service_name: '',
        description: '',
        size: '',
        category: '',
        estimated_duration: '',
        price: '',
        status: 'active',
    });

    const filteredServices = services.filter((s) => {
        const matchesCategory =
            selectedCategory === 'All' || s.category === selectedCategory;
        const matchesSearch =
            s.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
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
        setShowModal(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this service?')) {
            router.delete(`/services/${id}`, { preserveScroll: true });
        }
    };

    const handleAddNew = () => {
        setEditingService(null);
        reset();
        setShowModal(true);
    };

    const handleSubmit = () => {
        if (editingService) {
            put(`/services/${editingService.service_id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        } else {
            post('/services', {
                preserveScroll: true,
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        }
    };

    const formatDescription = (desc: string) => {
        return desc
            .replace(/,\s*/g, ', ')
            .split(', ')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(', ');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Services Management" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-start justify-between">
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
                <div className="rounded-lg border border-border bg-white p-4 dark:bg-black">
                    <div className="mb-2 flex items-center justify-between">
                        <div className="text-sm font-medium">
                            Search Services
                        </div>
                        <Select
                            value={selectedCategory}
                            onValueChange={setSelectedCategory}
                        >
                            <SelectTrigger className="w-[180px]">
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
                    <div className="flex items-center gap-3">
                        <Search className="h-5 w-5 text-foreground" />
                        <Input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 border-none bg-transparent text-foreground shadow-none focus-visible:ring-0"
                        />
                    </div>
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

                    <div className="custom-scrollbar h-[60vh] overflow-y-auto">
                        {filteredServices.length > 0 ? (
                            <div className="flex flex-wrap justify-center gap-4">
                                {filteredServices.map((s) => (
                                    <div
                                        key={s.service_id}
                                        className="flex w-sm flex-col justify-between gap-5 rounded-sm border p-4"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className="mb-2 text-base font-bold">
                                                    {s.service_name} -{' '}
                                                    {s.size
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatDescription(
                                                        s.description,
                                                    )}
                                                </p>
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() =>
                                                        handleEdit(s)
                                                    }
                                                    className="rounded p-1.5 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
                                                    title="Edit service"
                                                >
                                                    <Pencil className="h-4 w-4 text-black dark:text-white" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            s.service_id,
                                                        )
                                                    }
                                                    className="rounded p-1.5 text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950"
                                                    title="Delete service"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
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

                                        <div className="flex flex-col">
                                            <span className="font-bold">
                                                {s.size}
                                            </span>
                                        </div>
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
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>
                                {editingService
                                    ? 'Edit Service'
                                    : 'Add New Service'}
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
                                </div>

                                <div className="grid grid-cols-2 gap-4">
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
                                                <SelectItem
                                                    value="Small"
                                                    className="font-bold"
                                                >
                                                    Small
                                                </SelectItem>
                                                <SelectItem
                                                    value="Medium"
                                                    className="font-bold"
                                                >
                                                    Medium
                                                </SelectItem>
                                                <SelectItem
                                                    value="Large"
                                                    className="font-bold"
                                                >
                                                    Large
                                                </SelectItem>
                                                <SelectItem
                                                    value="X-Large"
                                                    className="font-bold"
                                                >
                                                    X-Large
                                                </SelectItem>
                                                <SelectItem
                                                    value="XX-Large"
                                                    className="font-bold"
                                                >
                                                    XX-Large
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
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
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
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
                                {processing
                                    ? 'Saving...'
                                    : editingService
                                      ? 'Update Service'
                                      : 'Create Service'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
