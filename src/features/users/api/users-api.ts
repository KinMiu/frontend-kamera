import { initialUsers } from '@/lib/mock-data';
import { User, UserFormData, PaginationParams, PaginatedResponse } from '@/types';
import { env } from '@/config/env';

// Stateful in-memory mock database for session CRUD operations
let usersDatabase: User[] = [...initialUsers];

// Helper delay simulator
const delay = (ms: number = 450) => new Promise((resolve) => setTimeout(resolve, ms));

export const usersApi = {
  getUsers: async (params: PaginationParams): Promise<PaginatedResponse<User>> => {
    await delay(350);

    let filtered = [...usersDatabase];

    // Search filter
    if (params.search && params.search.trim() !== '') {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.department.toLowerCase().includes(q)
      );
    }

    // Role filter
    if (params.role && params.role !== 'all') {
      filtered = filtered.filter((u) => u.role === params.role);
    }

    // Status filter
    if (params.status && params.status !== 'all') {
      filtered = filtered.filter((u) => u.status === params.status);
    }

    // Sorting
    if (params.sortBy) {
      filtered.sort((a, b) => {
        const aVal = a[params.sortBy as keyof User] || '';
        const bVal = b[params.sortBy as keyof User] || '';
        if (params.sortOrder === 'desc') {
          return aVal < bVal ? 1 : -1;
        }
        return aVal > bVal ? 1 : -1;
      });
    }

    const total = filtered.length;
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const totalPages = Math.ceil(total / pageSize);

    const startIndex = (page - 1) * pageSize;
    const paginatedData = filtered.slice(startIndex, startIndex + pageSize);

    return {
      data: paginatedData,
      total,
      page,
      pageSize,
      totalPages,
    };
  },

  getUserById: async (id: string): Promise<User> => {
    await delay(250);
    const user = usersDatabase.find((u) => u.id === id);
    if (!user) {
      throw new Error(`User with ID "${id}" was not found.`);
    }

    // Return user with default mock enrichments for details page
    return {
      phone: user.phone || '+62 21 515 0555',
      location: user.location || 'Jakarta Selatan, Indonesia',
      bio:
        user.bio ||
        'Experienced professional dedicated to delivering high-impact solutions with clean architecture, modern UX, and robust product engineering.',
      jobTitle:
        user.jobTitle ||
        `${user.role === 'Admin' ? 'Lead' : user.role === 'Manager' ? 'Principal' : 'Senior'} ${user.department} Specialist`,
      employmentType: user.employmentType || 'Full-time',
      twoFactorEnabled:
        user.twoFactorEnabled !== undefined ? user.twoFactorEnabled : true,
      latitude: user.latitude ?? -6.2255,
      longitude: user.longitude ?? 106.8097,
      address: user.address || 'Jl. Jend. Sudirman Kav. 52-53, SCBD',
      city: user.city || 'Jakarta Selatan',
      country: user.country || 'Indonesia',
      sessions: user.sessions || [
        {
          id: 'sess-1',
          device: 'Workstation Laptop',
          browser: 'Chrome 128 on Windows 11',
          ip: '192.168.1.104',
          location: 'Jakarta, ID',
          lastActive: 'Active now',
          isCurrent: true,
        },
        {
          id: 'sess-2',
          device: 'Apple iPhone 15 Pro',
          browser: 'Mobile Safari 17.4',
          ip: '172.56.21.90',
          location: 'Bandung, ID',
          lastActive: '2 hours ago',
          isCurrent: false,
        },
        {
          id: 'sess-3',
          device: 'MacBook Pro M2',
          browser: 'Firefox 129 on macOS Sonoma',
          ip: '192.168.1.189',
          location: 'Surabaya, ID',
          lastActive: '3 days ago',
          isCurrent: false,
        },
      ],
      activities: user.activities || [
        {
          id: 'act-1',
          action: 'Account Logged In',
          description: 'Successfully authenticated via SSO authentication provider.',
          timestamp: 'Today at 09:24 AM',
          ipAddress: '192.168.1.104',
          type: 'auth',
        },
        {
          id: 'act-2',
          action: 'Updated Profile Settings',
          description: 'Changed notification preferences and time zone offset.',
          timestamp: 'Yesterday at 04:15 PM',
          ipAddress: '192.168.1.104',
          type: 'edit',
        },
        {
          id: 'act-3',
          action: 'Exported User Report',
          description: 'Downloaded monthly activity summary as encrypted CSV file.',
          timestamp: '3 days ago',
          ipAddress: '192.168.1.104',
          type: 'system',
        },
        {
          id: 'act-4',
          action: 'Security Key Verified',
          description: 'Successfully verified 2FA hardware authenticator token.',
          timestamp: 'Last week',
          ipAddress: '192.168.1.104',
          type: 'security',
        },
      ],
      ...user,
    };
  },

  createUser: async (payload: UserFormData): Promise<User> => {
    await delay(450);
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      status: payload.status,
      department: payload.department || 'General',
      avatar: `https://images.unsplash.com/photo-${1535713875000 + Math.floor(Math.random() * 50000)}?w=150&auto=format&fit=crop&q=80`,
      createdAt: new Date().toISOString().split('T')[0],
      lastActive: 'Just now',
      phone: payload.phone || '+62 21 555 0192',
      location: `${payload.city || 'Jakarta Selatan'}, ${payload.country || 'Indonesia'}`,
      address: payload.address || 'Jl. Jend. Sudirman Kav. 52-53, SCBD',
      city: payload.city || 'Jakarta Selatan',
      country: payload.country || 'Indonesia',
      latitude: payload.latitude ?? -6.2255,
      longitude: payload.longitude ?? 106.8097,
      bio: 'Newly registered workspace contributor.',
      jobTitle: `${payload.role} in ${payload.department}`,
      employmentType: 'Full-time',
      twoFactorEnabled: false,
    };

    usersDatabase = [newUser, ...usersDatabase];
    return newUser;
  },

  updateUser: async (id: string, payload: Partial<User>): Promise<User> => {
    await delay(400);
    const index = usersDatabase.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new Error(`User with ID ${id} not found.`);
    }

    usersDatabase[index] = {
      ...usersDatabase[index],
      ...payload,
    };

    return usersDatabase[index];
  },

  deleteUser: async (id: string): Promise<{ success: boolean; id: string }> => {
    await delay(350);
    const index = usersDatabase.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new Error(`User with ID ${id} not found.`);
    }

    usersDatabase = usersDatabase.filter((u) => u.id !== id);
    return { success: true, id };
  },

  deleteMultipleUsers: async (ids: string[]): Promise<{ success: boolean; count: number }> => {
    await delay(400);
    const initialCount = usersDatabase.length;
    usersDatabase = usersDatabase.filter((u) => !ids.includes(u.id));
    const deletedCount = initialCount - usersDatabase.length;
    return { success: true, count: deletedCount };
  },
};
