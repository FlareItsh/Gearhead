import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Bays", href: "/bays" },
];

export default function Bays() {
    const [open, setOpen] = useState(false);
    const [bayType, setBayType] = useState("");

    const [bays, setBays] = useState<any[]>([
        { id: 1, number: 1, status: "available", type: "Normal" },
        { id: 2, number: 2, status: "available", type: "Normal" },
        { id: 3, number: 3, status: "available", type: "Normal" },
        { id: 4, number: 4, status: "available", type: "Normal" },
        { id: 5, number: 5, status: "available", type: "Normal" },
        { id: 6, number: 6, status: "available", type: "Underwash" },
    ]);

    const handleAddBay = () => {
        if (!bayType) return;

        const newBay = {
            id: bays.length + 1,
            number: bays.length + 1,
            type: bayType,
            status: "available",
        };

        setBays([...bays, newBay]);
        setOpen(false);
        setBayType("");
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
                    {bays.map((bay) => (
                        <Card key={bay.id} className="p-6">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Bay #{bay.number}</CardTitle>
                                <Badge variant={bay.status === "available" ? "success" : "destructive"} className="capitalize">
                                    {bay.status}
                                </Badge>
                            </CardHeader>
                            <CardDescription className="text-center text-gray-500 mt-4">
                                Ready for next service ({bay.type})
                            </CardDescription>
                        </Card>
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
                            <Button variant="secondary" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="highlight" onClick={handleAddBay}>
                                Confirm
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
