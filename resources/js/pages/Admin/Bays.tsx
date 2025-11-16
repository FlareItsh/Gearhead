import React, { useState } from "react";
import axios from "axios";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Bays", href: "/bays" },
];

export default function Bays({ bays }: { bays: any[] }) {
    const [open, setOpen] = useState(false);
    const [bayType, setBayType] = useState("");
    const [bayList, setBayList] = useState(bays);
    const [loading, setLoading] = useState(false);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState("");
    const [onConfirmAction, setOnConfirmAction] = useState<() => void>(() => {});

    const handleAddBay = () => {
        if (!bayType) return;

        setConfirmMessage(`Are you sure you want to add Bay #${bayList.length + 1} as ${bayType}?`);
        setOnConfirmAction(() => async () => {
            setLoading(true);
            try {
                const response = await axios.post("/bays", {
                    bay_number: bayList.length + 1,
                    bay_type: bayType,
                    status: "available",
                });
                setBayList([...bayList, response.data]);
                setOpen(false);
                setBayType("");
            } catch (error) {
                console.error("Error adding bay:", error);
            } finally {
                setLoading(false);
            }
        });
        setConfirmOpen(true);
    };

    const handleCancelDialog = () => {
        setConfirmMessage("Are you sure you want to cancel?");
        setOnConfirmAction(() => () => setOpen(false));
        setConfirmOpen(true);
    };

    const handleConfirm = async () => {
        await onConfirmAction();
        setConfirmOpen(false);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bays"/>
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Bay" description="Manage and Add Bays for new Carwash slots"/>
                    <Button variant="highlight" onClick={() => setOpen(true)}>+ Add Bay</Button>
                </div>

                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {bayList.map((bay) => (
                        <div
                            key={bay.bay_id}
                            className="w-full h-48 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-neutral-900 shadow-sm p-4 relative"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-semibold">Bay #{bay.bay_number}</h3>

                                <Badge
                                    variant={bay.status === "available" ? "success" : "destructive"}
                                    className="capitalize"
                                >
                                    {bay.status}
                                </Badge>
                            </div>
                            
                            <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-gray-500 text-sm text-center">
                                    Ready for next service ({bay.bay_type})
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="sm:max-w-md w-full rounded-xl p-6 shadow-lg">
                        <DialogHeader className="mb-4">
                            <DialogTitle>Add <span className="text-highlight font-bold">Bay</span></DialogTitle>
                        </DialogHeader>
                        <div className="mb-6">
                            <p className="mb-1">Bay Type</p>
                            <Select onValueChange={setBayType} value={bayType}>
                                <SelectTrigger className="w-full border border-gray-300 rounded-md">
                                    <SelectValue placeholder="Select Bay Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Normal">Normal</SelectItem>
                                    <SelectItem value="Underwash">Underwash</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter className="flex justify-end gap-3">
                            <Button variant="secondary" onClick={handleCancelDialog}>Cancel</Button>
                            <Button variant="highlight" onClick={handleAddBay} disabled={loading}>
                                {loading ? "Adding..." : "Confirm"}
                            </Button>
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
            </div>
        </AppLayout>
    );
}
