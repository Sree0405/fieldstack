import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/integrations/api/client';
import { toast } from 'sonner';

export interface Collection {
  id: string;
  name: string;
  displayName: string;
  tableName: string;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  fields?: Array<{
    id: string;
    name: string;
    type: string;
    required: boolean;
  }>;
}

export interface Field {
  id: string;
  collectionId: string;
  name: string;
  dbColumn: string;
  type: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'DATETIME' | 'FILE' | 'RELATION';
  required: boolean;
  defaultValue: string | null;
  uiComponent: string | null;
  createdAt: string;
  updatedAt: string;
}

export function useCollections() {
  return useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      const response = await apiClient.getCollections();
      if (response.error) {
        throw new Error(response.error.message);
      }
      return response.data || [];
    }
  });
}

export function useCollectionFields(collectionId: string) {
  return useQuery({
    queryKey: ['fields', collectionId],
    queryFn: async () => {
      // This would need an endpoint in backend to fetch fields
      // For now, return empty array
      return [] as Field[];
    },
    enabled: !!collectionId
  });
}

export function useCreateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (collection: { name: string; displayName: string; tableName: string }) => {
      const response = await apiClient.createCollection({
        name: collection.name,
        displayName: collection.displayName,
        tableName: collection.tableName,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast.success('Collection created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create collection');
    }
  });
}

export function useDeleteCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.deleteCollection(id);

      if (response.error) {
        throw new Error(response.error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast.success('Collection deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete collection');
    }
  });
}

export function useCreateField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (field: Omit<Field, 'id' | 'createdAt' | 'updatedAt'>) => {
      // This would need an endpoint in backend to create fields
      throw new Error('Field creation not yet implemented');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fields', variables.collectionId] });
      toast.success('Field created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create field');
    }
  });
}
