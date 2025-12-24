'use client';

import { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function PatientProfilePage() {
    const { success } = useToast();
    const [saving, setSaving] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        // Simulate save
        setTimeout(() => {
            success('Profile updated successfully');
            setSaving(false);
        }, 1000);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-outfit font-bold">Profile</h1>
                <p className="text-muted-foreground mt-1">
                    Manage your personal information
                </p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input id="firstName" placeholder="John" defaultValue="John" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input id="lastName" placeholder="Doe" defaultValue="Doe" />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="age">Age</Label>
                                <Input id="age" type="number" placeholder="30" defaultValue="30" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gender">Gender</Label>
                                <Input id="gender" placeholder="Male" defaultValue="Male" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="john@example.com" defaultValue="patient@shrs.com" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" type="tel" placeholder="+1234567890" defaultValue="+1234567890" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Textarea id="address" placeholder="Enter your address" defaultValue="123 Main St, City, Country" rows={3} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Medical Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="medical_history">Medical History</Label>
                            <Textarea
                                id="medical_history"
                                placeholder="Enter any relevant medical history"
                                rows={4}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline">
                        Cancel
                    </Button>
                    <Button type="submit" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
