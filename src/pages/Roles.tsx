'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Shield, Trash2, Edit2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { apiClient } from '@/integrations/api/client';
import { toast } from 'sonner';

interface Role {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function Roles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    const response = await apiClient.getAllRoles();
    if (response.data) {
      setRoles(response.data);
    } else {
      toast.error(response.error?.message || 'Failed to fetch roles');
    }
    setLoading(false);
  };

  const handleOpenDialog = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        displayName: role.displayName,
        description: role.description || '',
      });
    } else {
      setEditingRole(null);
      setFormData({
        name: '',
        displayName: '',
        description: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingRole(null);
    setFormData({
      name: '',
      displayName: '',
      description: '',
    });
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.displayName.trim()) {
      toast.error('Role name and display name are required');
      return;
    }

    try {
      if (editingRole) {
        // Update role
        const response = await apiClient.updateRole(editingRole.id, {
          displayName: formData.displayName,
          description: formData.description,
        });

        if (response.data) {
          toast.success('Role updated successfully');
          await fetchRoles();
          handleCloseDialog();
        } else {
          toast.error(response.error?.message || 'Failed to update role');
        }
      } else {
        // Create new role
        const response = await apiClient.createRole({
          name: formData.name.toLowerCase().replace(/\s+/g, '_'),
          displayName: formData.displayName,
          description: formData.description,
        });

        if (response.data) {
          toast.success('Role created successfully');
          await fetchRoles();
          handleCloseDialog();
        } else {
          toast.error(response.error?.message || 'Failed to create role');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    }
  };

  const handleDeleteRole = async (roleId: string, roleName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the "${roleName}" role? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const response = await apiClient.deleteRole(roleId);

      if (response.data || !response.error) {
        toast.success('Role deleted successfully');
        await fetchRoles();
      } else {
        toast.error(response.error?.message || 'Failed to delete role');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Roles & Permissions</h1>
          <p className="text-muted-foreground mt-2">
            Manage roles and assign them to users
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4" />
              New Role
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingRole ? 'Edit Role' : 'Create New Role'}</DialogTitle>
              <DialogDescription>
                {editingRole ? 'Update role information' : 'Create a new custom role'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveRole} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Role Name</label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!!editingRole}
                  placeholder="e.g., moderator"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Unique identifier (lowercase, no spaces)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Display Name</label>
                <Input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) =>
                    setFormData({ ...formData, displayName: e.target.value })
                  }
                  placeholder="e.g., Moderator"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of this role"
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingRole ? 'Update' : 'Create'} Role
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading roles...
          </div>
        ) : roles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No roles found. Create one to get started.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => (
              <div
                key={role.id}
                className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">
                        {role.displayName}
                      </h3>
                      <p className="text-xs text-muted-foreground">{role.name}</p>
                    </div>
                  </div>
                </div>

                {role.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {role.description}
                  </p>
                )}

                <div className="flex gap-2 pt-3 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(role)}
                    className="flex-1 gap-1"
                  >
                    <Edit2 className="h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteRole(role.id, role.displayName)}
                    className="flex-1 gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
