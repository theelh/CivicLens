import { Head, usePage, router } from '@inertiajs/react';
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';

interface UserManageProps {
    id: number;
    name: string;
    email: string;
    role: string;
    reports_count: number;
}

export default function UserManage() {
    const { users } = usePage().props as { users: { data: UserManageProps[], links: any[] } };
    const availableRoles = ['admin', 'staff', 'user'];
    const [toast, setToast] = useState<{show: boolean, userId?: number, message?: string}>({ show: false });

    const handleRoleChange = (userId: number, role: string) => {
        router.post(`/admin/users/${userId}/role`, { role });
        setToast({ show: true, message: `Role updated to ${role}` });
        setTimeout(() => setToast({ show: false }), 2500);
    };

    const handleDeleteUser = (userId: number, name: string) => {
        setToast({ show: true, userId, message: `Delete ${name}?` });
    };

    const confirmDelete = (userId: number) => {
        router.delete(`/admin/users/${userId}`);
        setToast({ show: false });
    };

    const cancelDelete = () => {
        setToast({ show: false });
    };

    return (
        <AppLayout>
            <Head title="User Management" />
            <div className="p-6">
                <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">User Management</h1>

                <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-neutral-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
                        <thead className="bg-gray-50 dark:bg-neutral-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Reports</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-neutral-900 divide-y divide-gray-200 dark:divide-neutral-700">
                            {users.data.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800 transition">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-neutral-100">{user.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-neutral-100">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-neutral-300">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <select
                                            className="border border-gray-300 rounded px-2 py-1 text-sm dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-100"
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        >
                                            {availableRoles.map((role) => (
                                                <option key={role} value={role}>
                                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700 dark:text-neutral-300 font-semibold">
                                        {user.reports_count}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                        <button
                                            onClick={() => handleDeleteUser(user.id, user.name)}
                                            className="text-red-600 hover:text-red-800 font-semibold px-3 py-1 rounded border border-red-600 hover:bg-red-50 dark:hover:bg-red-900 transition"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="mt-4 flex justify-center space-x-2">
                    {users.links.map((link: any, index: number) => (
                        <button
                            key={index}
                            disabled={!link.url}
                            onClick={() => link.url && router.get(link.url)}
                            className={`px-3 py-1 rounded ${
                                link.active
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </div>

            {/* Toast Confirmation */}
            {toast.show && (
                <div className="fixed bottom-6 right-6 w-80 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 shadow-lg rounded-xl p-4 z-50">
                    <p className="text-sm font-medium text-gray-900 dark:text-neutral-100">{toast.message}</p>
                    {toast.userId && (
                        <div className="mt-3 flex justify-end gap-2">
                            <button
                                onClick={() => confirmDelete(toast.userId!)}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                            >
                                Confirm
                            </button>
                            <button
                                onClick={cancelDelete}
                                className="px-3 py-1 bg-gray-200 dark:bg-neutral-700 text-gray-700 dark:text-neutral-200 rounded hover:bg-gray-300 dark:hover:bg-neutral-600 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            )}
        </AppLayout>
    );
}
