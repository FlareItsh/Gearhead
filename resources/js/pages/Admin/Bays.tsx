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
    const [bays, setBays] = useState<any[]>([]);
    const [bayType, setBayType] = useState("");

    const handleAddBay = () => {
        if (!bayType) return;
        const newBay = {
            id: bays.length + 1, number: bays.length + 1, type: bayType, status: "Available",
        };
        setBays([...bays, newBay]);
        setOpen(false);
        setBayType("");
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {/* Ulo */}
            <Head title="Bays"/>
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Bay" description="Manage and Add Bays for new Carwash slots"/>
                    <Button variant="highlight" onClick={() => setOpen(true)}>+ Add Bay</Button>
                </div>

                {/* Cardo */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {bays.map((bay) => (
                        <Card key={bay.id} className="p-6">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Bay #{bay.number}</CardTitle>
                                <Badge variant={bay.status === "Available" ? "success" : "destructive"}>
                                    {bay.status}
                                </Badge>
                            </CardHeader>
                            <CardDescription className="text-center text-gray-500 mt-4">Ready for next service ({bay.type})</CardDescription>
                        </Card>
                    ))}
                </div>

                {/* Model */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="sm:max-w-md w-full rounded-xl p-6 shadow-lg">
                        <DialogHeader className="mb-4">
                            <DialogTitle className="text-xl font-semibold text-yellow-600">Add New Bay</DialogTitle>
                        </DialogHeader>

                        <div className="mb-6">
                            <label className="block mb-2 text-sm font-medium text-gray-700">Bay Type</label>
                            <Select onValueChange={setBayType} value={bayType}>
                                <SelectTrigger className="w-full border border-gray-300 rounded-md focus:outline-none focus:border-gray-500">
                                    <SelectValue placeholder="Select Bay Type"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Normal">Normal</SelectItem>
                                    <SelectItem value="Underwash">Underwash</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <DialogFooter className="flex justify-end gap-3">
                            <Button variant="secondary" onClick={() => setOpen(false)} className="px-4 py-2">
                                Cancel
                            </Button>
                            <Button variant="highlight" onClick={handleAddBay} className="px-4 py-2">
                                Confirm
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
