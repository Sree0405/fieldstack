import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Trash2, Plus, Edit2 } from 'lucide-react';
import { apiClient } from '@/integrations/api/client';

export default function Content() {
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [newRecord, setNewRecord] = useState<any>({});
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [total, setTotal] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    if (selectedCollection) {
      fetchRecords();
    }
  }, [selectedCollection, page]);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getCollections();
      if (response.data) {
        setCollections(response.data);
        if (response.data.length > 0) {
          setSelectedCollection(response.data[0]);
          toast.success('Collections loaded');
        }
      } else if (response.error) {
        toast.error(`Failed to load collections: ${response.error.message}`);
      }
    } catch (error: any) {
      console.error('Failed to fetch collections:', error);
      toast.error('Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecords = async () => {
    if (!selectedCollection) return;
    try {
      const collectionId = selectedCollection.id;
      console.log(`Fetching records for collection: ${collectionId}`);

      const response = await apiClient.getCrudData(
        collectionId,
        page.toString(),
        limit.toString()
      );

      if (response.data) {
        const data = Array.isArray(response.data) ? response.data : response.data.data || [];
        setRecords(data);
        setTotal(response.data.total || data.length || 0);
      } else if (response.error) {
        console.error('Fetch error:', response.error);
        toast.error(`Failed to load records: ${response.error.message}`);
        setRecords([]);
        setTotal(0);
      }
    } catch (error: any) {
      console.error('Failed to fetch records:', error);
      toast.error('Failed to load records');
      setRecords([]);
      setTotal(0);
    }
  };

  const handleCreateRecord = async () => {
    if (!selectedCollection?.fields || selectedCollection.fields.length === 0) {
      toast.error('Collection has no fields');
      return;
    }

    // Validate required fields (skipping auto-managed system fields)
    const systemFields = ['id', 'created_at', 'updated_at', 'deleted_at', 'version'];
    const emptyRequired = selectedCollection.fields.some(
      (field: any) => field.required && !systemFields.includes(field.name) && !newRecord[field.name]
    );

    if (emptyRequired) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsCreating(true);
      const loadingToast = toast.loading('Creating record...');

      const recordToSubmit: any = {

      };

      selectedCollection.fields.forEach((field: any) => {
        if (!['id', 'created_at', 'updated_at', 'deleted_at', 'version'].includes(field.name)) {
          recordToSubmit[field.name] = newRecord[field.name] || null;
        }
      });

      console.log('Submitting record for collection:', selectedCollection.id, recordToSubmit);

      const response = await apiClient.createCrudItem(
        selectedCollection.id,
        recordToSubmit
      );

      if (response.error) {
        toast.dismiss(loadingToast);
        toast.error(`Failed to create record: ${response.error.message}`);
        console.error('Creation error:', response.error);
      } else {
        toast.dismiss(loadingToast);
        toast.success('Record created successfully!');
        setShowNewDialog(false);
        setNewRecord({});
        await fetchRecords();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create record');
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenEditDialog = (record: any) => {
    setEditingRecord({ ...record });
    setShowEditDialog(true);
  };

  const handleUpdateRecord = async () => {
    if (!editingRecord) {
      toast.error('No record selected');
      return;
    }

    try {
      setIsUpdating(true);
      const loadingToast = toast.loading('Updating record...');

      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      selectedCollection.fields.forEach((field: any) => {
        if (!['id', 'created_at', 'updated_at', 'deleted_at', 'version'].includes(field.name)) {
          updateData[field.name] = editingRecord[field.name] || null;
        }
      });

      console.log('Updating record in collection:', selectedCollection.id, updateData);

      const response = await apiClient.updateCrudItem(
        selectedCollection.id,
        editingRecord.id,
        updateData
      );

      if (response.error) {
        toast.dismiss(loadingToast);
        toast.error(`Failed to update record: ${response.error.message}`);
      } else {
        toast.dismiss(loadingToast);
        toast.success('Record updated successfully!');
        setShowEditDialog(false);
        setEditingRecord(null);
        await fetchRecords();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update record');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this record?')) {
      return;
    }

    try {
      setIsDeleting(true);
      const loadingToast = toast.loading('Deleting record...');

      const response = await apiClient.deleteCrudItem(
        selectedCollection.id,
        id
      );

      if (response.error) {
        toast.dismiss(loadingToast);
        toast.error(`Failed to delete record: ${response.error.message}`);
      } else {
        toast.dismiss(loadingToast);
        toast.success('Record deleted successfully!');
        await fetchRecords();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete record');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns =
    selectedCollection?.fields?.map((field: any) => ({
      name: field.name,
      type: field.type,
      dbColumn: field.dbColumn || field.name,
    })) || [];

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="w-full space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">📝 Content Manager</h1>
        <p className="text-muted-foreground">
          View and manage all your collection records
        </p>
      </div>

      {/* Collection Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Collection</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-muted-foreground">Loading...</div>
          ) : collections.length === 0 ? (
            <div className="text-muted-foreground">
              No collections found. Create one in the Collection Builder.
            </div>
          ) : (
            <Select
              value={selectedCollection?.id}
              onValueChange={(id) => {
                const collection = collections.find((c) => c.id === id);
                setSelectedCollection(collection);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {collections.map((collection) => (
                  <SelectItem key={collection.id} value={collection.id}>
                    {collection.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {/* Records */}
      {selectedCollection && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedCollection.displayName}</CardTitle>
                  <CardDescription>
                    {total} record{total !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
                <Button onClick={() => setShowNewDialog(true)} disabled={isCreating}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Record
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {records.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No records yet. Create one to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {columns.map((col: any) => (
                            <TableHead key={col.name}>{col.name}</TableHead>
                          ))}
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {records.map((record: any, idx: number) => (
                          <TableRow key={idx}>
                            {columns.map((col: any) => (
                              <TableCell key={col.name}>
                                <div className="max-w-xs truncate">
                                  {String(record[col.name] || '-')}
                                </div>
                              </TableCell>
                            ))}
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenEditDialog(record)}
                                  disabled={isUpdating}
                                  className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                >
                                  {isUpdating ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Edit2 className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteRecord(record.id)}
                                  disabled={isDeleting}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  {isDeleting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
                        disabled={page === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* New Record Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Record</DialogTitle>
            <DialogDescription>
              Add a new {selectedCollection?.displayName} record
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedCollection?.fields?.map((field: any) => {
              // Skip system auto-managed fields
              if (['id', 'created_at', 'updated_at', 'deleted_at', 'version'].includes(field.name)) {
                return null;
              }
              return (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.name}>
                    {field.name}
                    {field.required && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    id={field.name}
                    placeholder={field.name}
                    value={newRecord[field.name] || ''}
                    onChange={(e) =>
                      setNewRecord({
                        ...newRecord,
                        [field.name]: e.target.value,
                      })
                    }
                  />
                </div>
              );
            })}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowNewDialog(false)} disabled={isCreating}>
                Cancel
              </Button>
              <Button onClick={handleCreateRecord} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Record'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Record Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Record</DialogTitle>
            <DialogDescription>
              Update {selectedCollection?.displayName} record details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedCollection?.fields?.map((field: any) => {
              // Skip system auto-managed fields
              if (['id', 'created_at', 'updated_at', 'deleted_at', 'version'].includes(field.name)) {
                return null;
              }
              return (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={`edit-${field.name}`}>
                    {field.name}
                    {field.required && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    id={`edit-${field.name}`}
                    placeholder={field.name}
                    value={editingRecord?.[field.name] || ''}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        [field.name]: e.target.value,
                      })
                    }
                  />
                </div>
              );
            })}
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false);
                  setEditingRecord(null);
                }}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateRecord} disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Record'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
