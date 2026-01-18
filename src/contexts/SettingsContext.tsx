import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiClient, getAssetsUrl } from '@/integrations/api/client';

interface SiteSettings {
    siteName: string;
    siteTitle?: string;
    siteDescription?: string;
    siteUrl?: string;
    logoId?: string;
    faviconId?: string;
    metadata?: any;
    socialLinks?: any;
}

interface SettingsContextType {
    settings: SiteSettings | null;
    loading: boolean;
    refreshSettings: () => Promise<void>;
    getLogoUrl: () => string | undefined;
    getFaviconUrl: () => string | undefined;
    getLoginLogoUrl: () => string | undefined;
    getLoginTitle: () => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const response = await apiClient.getSiteInfo();
            if (response.data) {
                setSettings(response.data);

                // Update document title
                if (response.data.siteName) {
                    document.title = response.data.siteTitle || response.data.siteName;
                }

                // Update favicon
                if (response.data.faviconId) {
                    const faviconUrl = getAssetsUrl(response.data.faviconId);
                    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
                    if (link) {
                        link.href = faviconUrl;
                    } else {
                        const newLink = document.createElement('link');
                        newLink.rel = 'icon';
                        newLink.href = faviconUrl;
                        document.head.appendChild(newLink);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to load site settings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const getLogoUrl = () => {
        if (settings?.logoId) {
            return getAssetsUrl(settings.logoId);
        }
        return undefined;
    };

    const getFaviconUrl = () => {
        if (settings?.faviconId) {
            return getAssetsUrl(settings.faviconId);
        }
        return undefined;
    };

    const getLoginLogoUrl = () => {
        if (settings?.metadata?.loginLogoId) {
            return getAssetsUrl(settings.metadata.loginLogoId);
        }
        return getLogoUrl();
    };

    const getLoginTitle = () => {
        return settings?.metadata?.loginTitle || settings?.siteName || 'fieldstack';
    };

    return (
        <SettingsContext.Provider
            value={{
                settings,
                loading,
                refreshSettings: fetchSettings,
                getLogoUrl,
                getFaviconUrl,
                getLoginLogoUrl,
                getLoginTitle
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
