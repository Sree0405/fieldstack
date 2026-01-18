import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Trash2, Upload, Copy, Check } from 'lucide-react';
import { apiClient, getAssetsUrl } from '@/integrations/api/client';

export default function FileManager() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchFiles();
  }, [page]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const offset = (page - 1) * limit;
      const response = await apiClient.getAllFiles(limit, offset);

      if (response.data) {
        setFiles(response.data.data || []);
        setTotal(response.data.total || 0);
      } else {
        toast.error(`Failed to load files: ${response.error?.message}`);
        setFiles([]);
      }
    } catch (error) {
      console.error('Failed to fetch files:', error);
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    try {
      setUploading(true);
      const loadingToast = toast.loading(
        `Uploading ${selectedFiles.length} file(s)...`
      );

      const fileArray = Array.from(selectedFiles);

      if (fileArray.length === 1) {
        // Single file upload
        const response = await apiClient.uploadFile(fileArray[0]);

        if (response.error) {
          toast.dismiss(loadingToast);
          toast.error(`Upload failed: ${response.error.message}`);
        } else {
          toast.dismiss(loadingToast);
          toast.success('File uploaded successfully!');
          fetchFiles();
          setShowUploadDialog(false);
        }
      } else {
        // Multiple files upload
        const response = await apiClient.uploadMultipleFiles(fileArray);

        if (response.error) {
          toast.dismiss(loadingToast);
          toast.error(`Upload failed: ${response.error.message}`);
        } else {
          toast.dismiss(loadingToast);
          toast.success(`${fileArray.length} files uploaded successfully!`);
          fetchFiles();
          setShowUploadDialog(false);
        }
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('File upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      setDeleting(true);
      const loadingToast = toast.loading('Deleting file...');

      const response = await apiClient.deleteFile(fileId);

      if (response.error) {
        toast.dismiss(loadingToast);
        toast.error(`Delete failed: ${response.error.message}`);
      } else {
        toast.dismiss(loadingToast);
        toast.success('File deleted successfully!');
        fetchFiles();
      }
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete file');
    } finally {
      setDeleting(false);
    }
  };

  const copyToClipboard = (text: string, fileId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(fileId);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="w-full space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">📁 File Manager</h1>
        <p className="text-muted-foreground">
          Upload and manage your media files, images, and videos
        </p>
      </div>

      {/* Upload Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Upload Files</CardTitle>
              <CardDescription>
                Drag and drop or select files to upload
              </CardDescription>
            </div>
            <Button onClick={() => setShowUploadDialog(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Files Table */}
      <Card>
        <CardHeader>
          <CardTitle>Files</CardTitle>
          <CardDescription>
            {total} file{total !== 1 ? 's' : ''} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              Loading files...
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No files uploaded yet. Upload one to get started.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Asset URL</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {files.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell className="font-medium">
                          <div className="truncate">{file.originalName}</div>
                        </TableCell>
                        <TableCell>{file.mimeType}</TableCell>
                        <TableCell>{formatFileSize(file.size)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded max-w-xs truncate">
                              {getAssetsUrl(file.id)}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                copyToClipboard(getAssetsUrl(file.id), file.id)
                              }
                            >
                              {copiedId === file.id ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteFile(file.id)}
                            disabled={deleting}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            {deleting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
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
                    onClick={() =>
                      setPage((p) => (p < totalPages ? p + 1 : p))
                    }
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

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
            <DialogDescription>
              Select one or more files to upload to your site
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="file"
              multiple
              onChange={handleFileUpload}
              disabled={uploading}
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
            />
            <p className="text-sm text-muted-foreground">
              Supports: Images, Videos, Audio, PDF, Documents, and Text files
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowUploadDialog(false)}
                disabled={uploading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
