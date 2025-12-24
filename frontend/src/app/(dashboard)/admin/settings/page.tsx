'use client';

import { useState } from 'react';
import { Settings as SettingsIcon, Save, Bell, Shield, Palette, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import { useToast } from '@/components/ui/Toast';
import { useTheme } from '@/contexts/ThemeContext';

export default function SettingsPage() {
    const { success } = useToast();
    const { theme, setTheme } = useTheme();
    const [settings, setSettings] = useState({
        siteName: 'SHRS',
        adminEmail: 'admin@shrs.com',
        timezone: 'UTC',
        language: 'en',
        emailNotifications: true,
        smsNotifications: false,
    });

    const handleSave = () => {
        // In a real app, this would save to the backend
        success('Settings saved successfully!');
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-outfit font-bold">Settings</h1>
                <p className="text-muted-foreground mt-1">
                    Configure system preferences
                </p>
            </div>

            <div className="grid gap-6">
                {/* General Settings */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <SettingsIcon className="h-5 w-5 text-primary" />
                            <div>
                                <CardTitle>General Settings</CardTitle>
                                <CardDescription>Basic system configuration</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="siteName">Site Name</Label>
                            <Input
                                id="siteName"
                                value={settings.siteName}
                                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <Label htmlFor="adminEmail">Admin Email</Label>
                            <Input
                                id="adminEmail"
                                type="email"
                                value={settings.adminEmail}
                                onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                                className="mt-2"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Localization */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Globe className="h-5 w-5 text-primary" />
                            <div>
                                <CardTitle>Localization</CardTitle>
                                <CardDescription>Regional and language settings</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="timezone">Timezone</Label>
                            <Select
                                id="timezone"
                                value={settings.timezone}
                                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                                className="mt-2"
                            >
                                <option value="UTC">UTC</option>
                                <option value="America/New_York">Eastern Time (US)</option>
                                <option value="Europe/London">London</option>
                                <option value="Asia/Tokyo">Tokyo</option>
                                <option value="Asia/Kolkata">India (IST)</option>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="language">Language</Label>
                            <Select
                                id="language"
                                value={settings.language}
                                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                                className="mt-2"
                            >
                                <option value="en">English</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                                <option value="de">German</option>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Appearance */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Palette className="h-5 w-5 text-primary" />
                            <div>
                                <CardTitle>Appearance</CardTitle>
                                <CardDescription>Customize the look and feel</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="theme">Theme</Label>
                            <Select
                                id="theme"
                                value={theme}
                                onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'auto')}
                                className="mt-2"
                            >
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                                <option value="auto">Auto (System)</option>
                            </Select>
                            <p className="text-xs text-muted-foreground mt-2">
                                Current theme: {theme === 'auto' ? 'Following system preference' : theme}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-primary" />
                            <div>
                                <CardTitle>Notifications</CardTitle>
                                <CardDescription>Manage notification preferences</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Email Notifications</Label>
                                <p className="text-sm text-muted-foreground">
                                    Receive email alerts for appointments
                                </p>
                            </div>
                            <Button
                                variant={settings.emailNotifications ? 'default' : 'outline'}
                                size="sm"
                                onClick={() =>
                                    setSettings({
                                        ...settings,
                                        emailNotifications: !settings.emailNotifications,
                                    })
                                }
                            >
                                {settings.emailNotifications ? 'Enabled' : 'Disabled'}
                            </Button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>SMS Notifications</Label>
                                <p className="text-sm text-muted-foreground">
                                    Receive text messages for critical updates
                                </p>
                            </div>
                            <Button
                                variant={settings.smsNotifications ? 'default' : 'outline'}
                                size="sm"
                                onClick={() =>
                                    setSettings({
                                        ...settings,
                                        smsNotifications: !settings.smsNotifications,
                                    })
                                }
                            >
                                {settings.smsNotifications ? 'Enabled' : 'Disabled'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Security */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            <div>
                                <CardTitle>Security</CardTitle>
                                <CardDescription>System security settings</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Two-Factor Authentication</Label>
                                <p className="text-sm text-muted-foreground">
                                    Add an extra layer of security
                                </p>
                            </div>
                            <Button variant="outline" size="sm">
                                Configure
                            </Button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Session Timeout</Label>
                                <p className="text-sm text-muted-foreground">
                                    Automatically log out after inactivity
                                </p>
                            </div>
                            <Select className="w-32" defaultValue="30">
                                <option value="15">15 minutes</option>
                                <option value="30">30 minutes</option>
                                <option value="60">1 hour</option>
                                <option value="120">2 hours</option>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button onClick={handleSave} size="lg">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
}
