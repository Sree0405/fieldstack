import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Loader2, Trash2, Upload, Copy, Check, FileText, Image as ImageIcon, Film, Music, Download } from 'lucide-react';
import { apiClient, getAssetsUrl } from '@/integrations/api/client';
import { format } from 'date-fns';

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

  // Detail View State
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [showDetailSheet, setShowDetailSheet] = useState(false);

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
        if (selectedFile?.id === fileId) {
          setShowDetailSheet(false);
          setSelectedFile(null);
        }
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

  const openFileDetails = (file: any) => {
    setSelectedFile(file);
    setShowDetailSheet(true);
  };

  const renderFilePreview = (file: any) => {
    if (!file) return null;
    const url = getAssetsUrl(file.id);

    if (file.mimeType.startsWith('image/')) {
      return (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100 border">
          <img
            src={url}
            alt={file.originalName}
            className="h-full w-full object-contain"
          />
        </div>
      );
    }

    if (file.mimeType.startsWith('video/')) {
      return (
        <video controls className="w-full rounded-lg border bg-black">
          <source src={url} type={file.mimeType} />
          Your browser does not support the video tag.
        </video>
      );
    }

    if (file.mimeType.startsWith('audio/')) {
      return (
        <div className="p-4 bg-gray-50 rounded-lg border flex flex-col items-center gap-2">
          <Music className="h-12 w-12 text-gray-400" />
          <audio controls className="w-full">
            <source src={url} type={file.mimeType} />
            Your browser does not support the audio element.
          </audio>
        </div>
      );
    }

    // Default icon
    return (
      <div className="flex h-40 w-full items-center justify-center rounded-lg border bg-gray-50">
        <FileText className="h-16 w-16 text-gray-300" />
      </div>
    );
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
          <CardTitle>Combined Media Library</CardTitle>
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
                      <TableHead>Preview</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {files.map((file) => (
                      <TableRow
                        key={file.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => openFileDetails(file)}
                      >
                        <TableCell>
                          {file.mimeType.startsWith('image/') ? (
                            <img src={getAssetsUrl(file.id)} className="h-10 w-10 rounded object-cover border" alt="preview" />
                          ) : (
                            <FileText className="h-8 w-8 text-gray-400" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="truncate max-w-[200px]" title={file.originalName}>
                            {file.originalName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                            {file.mimeType}
                          </span>
                        </TableCell>
                        <TableCell>{formatFileSize(file.size)}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {file.createdAt ? format(new Date(file.createdAt), 'MMM d, yyyy') : '-'}
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
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
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteFile(file.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
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

      {/* Detail View Sheet */}
      <Sheet open={showDetailSheet} onOpenChange={setShowDetailSheet}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>File Details</SheetTitle>
            <SheetDescription>Verify and manage file metadata</SheetDescription>
          </SheetHeader>

          {selectedFile && (
            <div className="space-y-6">
              {/* Preview */}
              <div className="flex justify-center">
                {renderFilePreview(selectedFile)}
              </div>

              {/* Metadata */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">File Name</p>
                    <p className="text-sm font-medium truncate" title={selectedFile.originalName}>
                      {selectedFile.originalName}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">File ID</p>
                    <p className="text-xs font-mono bg-muted p-1 rounded truncate" title={selectedFile.id}>
                      {selectedFile.id}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Type</p>
                    <p className="text-sm">{selectedFile.mimeType}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Size</p>
                    <p className="text-sm">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Uploaded</p>
                    <p className="text-sm">
                      {selectedFile.createdAt ? format(new Date(selectedFile.createdAt), 'PPpp') : '-'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Public URL</p>
                  <div className="flex gap-2">
                    <Input readOnly value={getAssetsUrl(selectedFile.id)} className="font-mono text-xs" />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => copyToClipboard(getAssetsUrl(selectedFile.id), selectedFile.id)}
                    >
                      {copiedId === selectedFile.id ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button className="flex-1" variant="outline" asChild>
                  <a href={getAssetsUrl(selectedFile.id)} download target="_blank" rel="noreferrer">
                    <Download className="mr-2 h-4 w-4" /> Download
                  </a>
                </Button>
                <Button
                  className="flex-1"
                  variant="destructive"
                  onClick={() => handleDeleteFile(selectedFile.id)}
                  disabled={deleting}
                >
                  {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                  Delete File
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

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
