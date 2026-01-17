import { useQuery } from '@tanstack/react-query';

export function useUserRoles(userId?: string) {
  return useQuery({
    queryKey: ['user-roles', userId],
    queryFn: async () => {
      if (!userId) return [];
      // This would need a backend endpoint to fetch user roles
      // For now, return empty array
      return [];
    },
    enabled: !!userId
  });
}

export function useIsAdmin(userId?: string) {
  const { data: roles } = useUserRoles(userId);
  return roles?.some((r: any) => r.role === 'ADMIN') ?? false;
}
