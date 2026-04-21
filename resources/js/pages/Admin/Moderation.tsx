import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Upload, QrCode, Gift, CreditCard } from 'lucide-react';
import { useState } from 'react';

interface GcashSettings {
    account_name: string;
    account_number: string;
    qr_code_path: string | null;
    qr_code_url: string | null;
}

interface ModerationProps {
    loyaltyThreshold: number;
    gcashSettings: GcashSettings;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Moderation',
        href: '/moderation',
    },
];

export default function Moderation({ loyaltyThreshold, gcashSettings }: ModerationProps) {
    // Loyalty Form
    const loyaltyForm = useForm({
        threshold: loyaltyThreshold,
    });

    const submitLoyalty = (e: React.FormEvent) => {
        e.preventDefault();
        loyaltyForm.post(route('admin.moderation.loyalty'), {
            preserveScroll: true,
        });
    };

    // GCash Form
    const [preview, setPreview] = useState<string | null>(gcashSettings.qr_code_url);
    const gcashForm = useForm({
        account_name: gcashSettings.account_name,
        account_number: gcashSettings.account_number,
        qr_code: null as File | null,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            gcashForm.setData('qr_code', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const submitGcash = (e: React.FormEvent) => {
        e.preventDefault();
        gcashForm.post(route('admin.moderation.gcash'), {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Moderation" />

            <div className="space-y-8 p-6 lg:p-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Moderation Hub</h1>
                    <p className="text-muted-foreground">Manage application-wide rules and settings.</p>
                </div>

                <div className="grid gap-8">
                    {/* Loyalty Settings */}
                    <Card>
                        <CardHeader className="py-6">
                            <CardTitle className="flex items-center gap-2">
                                <Gift className="h-5 w-5 text-highlight" />
                                Loyalty Program
                            </CardTitle>
                            <CardDescription>
                                Configure the criteria for the free wash loyalty program.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="py-8">
                            <form onSubmit={submitLoyalty} className="space-y-4">
                                <div className="max-w-md space-y-2">
                                    <Label htmlFor="threshold">Free Wash Threshold</Label>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground text-sm">
                                                    Every
                                                </span>
                                                <Input
                                                    id="threshold"
                                                    type="number"
                                                    className="pl-14 pr-24"
                                                    value={loyaltyForm.data.threshold}
                                                    onChange={(e) => loyaltyForm.setData('threshold', parseInt(e.target.value))}
                                                    required
                                                    min="1"
                                                    max="100"
                                                />
                                                <span className="absolute inset-y-0 right-3 flex items-center text-muted-foreground text-sm">
                                                    wash is free
                                                </span>
                                            </div>
                                        </div>
                                        <Button disabled={loyaltyForm.processing} variant="highlight">
                                            {loyaltyForm.processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                                            Update
                                        </Button>
                                    </div>
                                    <InputError message={loyaltyForm.errors.threshold} />
                                    <Transition
                                        show={loyaltyForm.recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-green-600">Loyalty threshold updated!</p>
                                    </Transition>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* GCash Settings */}
                    <Card>
                        <CardHeader className="py-6">
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-highlight" />
                                Shop GCash Information
                            </CardTitle>
                            <CardDescription>
                                Update the GCash account details displayed to customers at checkout.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="py-8">
                            <form onSubmit={submitGcash} className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="account_name">GCash Account Name</Label>
                                            <Input
                                                id="account_name"
                                                value={gcashForm.data.account_name}
                                                onChange={(e) => gcashForm.setData('account_name', e.target.value)}
                                                required
                                                placeholder="e.g. JUAN DELA CRUZ"
                                            />
                                            <InputError message={gcashForm.errors.account_name} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="account_number">GCash Phone Number</Label>
                                            <Input
                                                id="account_number"
                                                value={gcashForm.data.account_number}
                                                onChange={(e) => gcashForm.setData('account_number', e.target.value)}
                                                required
                                                placeholder="e.g. 09123456789"
                                            />
                                            <InputError message={gcashForm.errors.account_number} />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>QR Code Image</Label>
                                        <div className="mt-2 flex items-start gap-6">
                                            <div className="relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50">
                                                {preview ? (
                                                    <img src={preview} alt="QR Code" className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                        <QrCode className="h-8 w-8" />
                                                        <span className="text-xs">No QR Code</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-4">
                                                <Label
                                                    htmlFor="qr_code"
                                                    className="flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                                                >
                                                    <Upload className="h-4 w-4" />
                                                    {preview ? 'Change QR Image' : 'Upload QR Image'}
                                                    <input
                                                        id="qr_code"
                                                        type="file"
                                                        className="hidden"
                                                        onChange={handleFileChange}
                                                        accept="image/*"
                                                    />
                                                </Label>
                                                <p className="text-xs text-muted-foreground">
                                                    JPG, PNG or GIF. Max size 2MB.
                                                </p>
                                                <InputError message={gcashForm.errors.qr_code} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button disabled={gcashForm.processing} variant="highlight">
                                        {gcashForm.processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                                        Save GCash Settings
                                    </Button>

                                    <Transition
                                        show={gcashForm.recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-green-600">GCash info updated!</p>
                                    </Transition>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
