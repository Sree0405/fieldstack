import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload } from 'lucide-react';
import { apiClient, getAssetsUrl } from '@/integrations/api/client';

export default function Settings() {
  const [siteInfo, setSiteInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingLoginLogo, setUploadingLoginLogo] = useState(false);

  // ... (previous handles) ...

  const handleLoginLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLoginLogo(true);
      const loadingToast = toast.loading('Uploading login logo...');

      const uploadResponse = await apiClient.uploadFile(file);

      if (uploadResponse.error) {
        toast.dismiss(loadingToast);
        toast.error(`Upload failed: ${uploadResponse.error.message}`);
        return;
      }

      const fileId = uploadResponse.data.id;

      // Update local state metadata with new fileId
      setSiteInfo((prev: any) => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          loginLogoId: fileId
        }
      }));

      // No immediate save - user must click Save Changes
      toast.dismiss(loadingToast);
      toast.success('Login logo uploaded! Don\'t forget to save.');

    } catch (error) {
      console.error('Failed to upload logo:', error);
      toast.error('Failed to upload logo');
    } finally {
      setUploadingLoginLogo(false);
    }
  };

  useEffect(() => {
    fetchSiteInfo();
  }, []);

  const fetchSiteInfo = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getSiteInfo();
      if (response.data) {
        setSiteInfo(response.data);
        toast.success('Site settings loaded');
      } else {
        toast.error(`Failed to load site info: ${response.error?.message}`);
      }
    } catch (error) {
      console.error('Failed to fetch site info:', error);
      toast.error('Failed to load site settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInfo = async () => {
    if (!siteInfo) return;

    try {
      setUpdating(true);
      const loadingToast = toast.loading('Updating site info...');

      const response = await apiClient.updateSiteInfo({
        siteName: siteInfo.siteName,
        siteTitle: siteInfo.siteTitle,
        siteDescription: siteInfo.siteDescription,
        siteUrl: siteInfo.siteUrl,
        contactEmail: siteInfo.contactEmail,
        contactPhone: siteInfo.contactPhone,
        socialLinks: siteInfo.socialLinks,
      });

      if (response.error) {
        toast.dismiss(loadingToast);
        toast.error(`Failed to update: ${response.error.message}`);
      } else {
        toast.dismiss(loadingToast);
        toast.success('Site info updated successfully!');
        setSiteInfo(response.data);
      }
    } catch (error) {
      console.error('Failed to update site info:', error);
      toast.error('Failed to update site info');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      const loadingToast = toast.loading('Uploading logo...');

      const uploadResponse = await apiClient.uploadFile(file);

      if (uploadResponse.error) {
        toast.dismiss(loadingToast);
        toast.error(`Upload failed: ${uploadResponse.error.message}`);
        return;
      }

      const fileId = uploadResponse.data.id;

      const response = await apiClient.updateSiteLogo(fileId);

      if (response.error) {
        toast.dismiss(loadingToast);
        toast.error(`Failed to update logo: ${response.error.message}`);
      } else {
        toast.dismiss(loadingToast);
        toast.success('Logo updated successfully!');
        setSiteInfo(response.data);
      }
    } catch (error) {
      console.error('Failed to upload logo:', error);
      toast.error('Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingFavicon(true);
      const loadingToast = toast.loading('Uploading favicon...');

      const uploadResponse = await apiClient.uploadFile(file);

      if (uploadResponse.error) {
        toast.dismiss(loadingToast);
        toast.error(`Upload failed: ${uploadResponse.error.message}`);
        return;
      }

      const fileId = uploadResponse.data.id;

      const response = await apiClient.updateSiteFavicon(fileId);

      if (response.error) {
        toast.dismiss(loadingToast);
        toast.error(`Failed to update favicon: ${response.error.message}`);
      } else {
        toast.dismiss(loadingToast);
        toast.success('Favicon updated successfully!');
        setSiteInfo(response.data);
      }
    } catch (error) {
      console.error('Failed to upload favicon:', error);
      toast.error('Failed to upload favicon');
    } finally {
      setUploadingFavicon(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full space-y-6 p-6">
        <div className="text-center py-8 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          Loading site settings...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">⚙️ Site Settings</h1>
        <p className="text-muted-foreground">
          Manage your site information and branding
        </p>
      </div>

      {siteInfo && (
        <>
          {/* Site Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Site Information</CardTitle>
              <CardDescription>Basic site details and metadata</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={siteInfo.siteName || ''}
                  onChange={(e) =>
                    setSiteInfo({ ...siteInfo, siteName: e.target.value })
                  }
                  placeholder="e.g., My Awesome Site"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteTitle">Site Title</Label>
                <Input
                  id="siteTitle"
                  value={siteInfo.siteTitle || ''}
                  onChange={(e) =>
                    setSiteInfo({ ...siteInfo, siteTitle: e.target.value })
                  }
                  placeholder="e.g., Welcome to My Site"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={siteInfo.siteDescription || ''}
                  onChange={(e) =>
                    setSiteInfo({ ...siteInfo, siteDescription: e.target.value })
                  }
                  placeholder="Brief description of your site"
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteUrl">Site URL</Label>
                <Input
                  id="siteUrl"
                  type="url"
                  value={siteInfo.siteUrl || ''}
                  onChange={(e) =>
                    setSiteInfo({ ...siteInfo, siteUrl: e.target.value })
                  }
                  placeholder="https://example.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Contact details for your site</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={siteInfo.contactEmail || ''}
                  onChange={(e) =>
                    setSiteInfo({ ...siteInfo, contactEmail: e.target.value })
                  }
                  placeholder="contact@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Phone</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={siteInfo.contactPhone || ''}
                  onChange={(e) =>
                    setSiteInfo({ ...siteInfo, contactPhone: e.target.value })
                  }
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </CardContent>
          </Card>

          {/* Branding Card */}
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>Upload your site logo and favicon</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo */}
              <div className="space-y-3">
                <Label>Logo</Label>
                {siteInfo.logoId && (
                  <div className="mb-3">
                    <img
                      src={getAssetsUrl(siteInfo.logoId)}
                      alt="Logo"
                      className="max-h-32 rounded-lg border"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="flex-1"
                  />
                  {uploadingLogo && (
                    <Loader2 className="h-4 w-4 animate-spin mt-3" />
                  )}
                </div>
              </div>

              {/* Favicon */}
              <div className="space-y-3">
                <Label>Favicon</Label>
                {siteInfo.faviconId && (
                  <div className="mb-3">
                    <img
                      src={getAssetsUrl(siteInfo.faviconId)}
                      alt="Favicon"
                      className="w-16 h-16 rounded-lg border"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFaviconUpload}
                    disabled={uploadingFavicon}
                    className="flex-1"
                  />
                  {uploadingFavicon && (
                    <Loader2 className="h-4 w-4 animate-spin mt-3" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Authentication Branding Card */}
          <Card>
            <CardHeader>
              <CardTitle>Authentication Branding</CardTitle>
              <CardDescription>Customize the look of your login page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="loginTitle">Login Title Override</Label>
                <Input
                  id="loginTitle"
                  value={siteInfo.metadata?.loginTitle || ''}
                  onChange={(e) =>
                    setSiteInfo({
                      ...siteInfo,
                      metadata: { ...siteInfo.metadata, loginTitle: e.target.value },
                    })
                  }
                  placeholder={`Default: ${siteInfo.siteName || 'Fieldstack'}`}
                />
              </div>

              {/* Login Logo */}
              <div className="space-y-3">
                <Label>Login Logo Override</Label>
                {siteInfo.metadata?.loginLogoId && (
                  <div className="mb-3">
                    <img
                      src={getAssetsUrl(siteInfo.metadata.loginLogoId)}
                      alt="Login Logo"
                      className="max-h-32 rounded-lg border"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLoginLogoUpload}
                    disabled={uploadingLoginLogo}
                    className="flex-1"
                  />
                  {uploadingLoginLogo && (
                    <Loader2 className="h-4 w-4 animate-spin mt-3" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={fetchSiteInfo} disabled={updating}>
              Reset
            </Button>
            <Button onClick={handleUpdateInfo} disabled={updating}>
              {updating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
