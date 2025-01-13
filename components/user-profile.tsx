'use client';

import { useState } from 'react';
import { auth } from '@/app/(auth)/auth';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cookies } from 'next/headers';

export default async function UserProfile() {
    const [isOpen, setIsOpen] = useState(false);
    const [session, cookieStore] = await Promise.all([auth(), cookies()]);

    if (!session) return null;

    const user = session.user;
    if (!user) return null;

    const initials = user.name?.charAt(0) || 'U';

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setIsOpen(true)}
            >
                <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image || "/avatar-placeholder.png"} alt={user.name || "User"} />
                    <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
            </Button>

            {isOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center">
                    <div
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />
                    <Card className="z-[1000] w-[90%] max-w-2xl mx-auto relative">
                        <CardHeader>
                            <CardTitle>Profile</CardTitle>
                            <CardDescription>Your account information</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={user.image || "/avatar-placeholder.png"} alt={user.name || "User"} />
                                    <AvatarFallback>{initials}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-lg font-medium">{user.name}</h3>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                            </div>
                            <Button
                                className="mt-6"
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                            >
                                Close
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </>
    );
}
