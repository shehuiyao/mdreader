import { useState, useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { relaunch } from '@tauri-apps/plugin-process';
import { useAppStore } from '../../stores/useAppStore';
import { t } from '../../lib/i18n';

type UpdateStatus = 'idle' | 'checking' | 'up-to-date' | 'update-available' | 'downloading' | 'done' | 'error';

interface UpdateInfo {
  current_version: string;
  latest_version: string;
  update_available: boolean;
  download_url: string;
}

const APP_VERSION = '0.2.0';

export default function StatusBar() {
  const locale = useAppStore((s) => s.locale);
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>('idle');
  const [latestVersion, setLatestVersion] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const checkCancelledRef = useRef(false);

  const handleCancelCheck = useCallback(() => {
    checkCancelledRef.current = true;
    setUpdateStatus('idle');
  }, []);

  const handleCheckUpdate = useCallback(async () => {
    if (updateStatus === 'checking' || updateStatus === 'downloading') return;
    checkCancelledRef.current = false;
    setUpdateStatus('checking');
    try {
      const info = await Promise.race([
        invoke<UpdateInfo>('check_for_update'),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Update check timed out')), 15000)
        ),
      ]);
      if (checkCancelledRef.current) return;
      if (info.update_available) {
        setLatestVersion(info.latest_version);
        setDownloadUrl(info.download_url);
        setUpdateStatus('update-available');
      } else {
        setUpdateStatus('up-to-date');
        setTimeout(() => setUpdateStatus('idle'), 3000);
      }
    } catch (e: unknown) {
      if (checkCancelledRef.current) return;
      const msg = e instanceof Error ? e.message : String(e);
      console.error('Update check error:', msg);
      setUpdateStatus('error');
      setErrorMsg(msg);
      setTimeout(() => setUpdateStatus('idle'), 5000);
    }
  }, [updateStatus]);

  const handleDownloadAndInstall = useCallback(async () => {
    if (!downloadUrl) return;
    try {
      setUpdateStatus('downloading');
      await invoke('download_and_install_update', { url: downloadUrl });
      setUpdateStatus('done');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setUpdateStatus('error');
      setErrorMsg(msg);
      setTimeout(() => setUpdateStatus('idle'), 5000);
    }
  }, [downloadUrl]);

  const handleRelaunch = useCallback(async () => {
    await relaunch();
  }, []);

  const renderUpdateContent = () => {
    switch (updateStatus) {
      case 'checking':
        return (
          <span className="animate-pulse" style={{ color: 'var(--text-secondary)' }}>
            {t(locale, 'updateChecking')}{' '}
            <button
              onClick={handleCancelCheck}
              className="hover:opacity-80 cursor-pointer bg-transparent border-none p-0"
              style={{ color: 'var(--text-muted)', fontSize: '10px' }}
            >
              {t(locale, 'updateCancel')}
            </button>
          </span>
        );
      case 'up-to-date':
        return <span style={{ color: 'var(--accent-green)' }}>{t(locale, 'updateUpToDate')}</span>;
      case 'update-available':
        return (
          <span style={{ color: 'var(--accent-orange)' }}>
            v{latestVersion} {t(locale, 'updateAvailable')}{' · '}
            <button
              onClick={handleDownloadAndInstall}
              className="underline cursor-pointer bg-transparent border-none p-0"
              style={{ color: 'var(--accent-orange)', fontSize: '10px' }}
            >
              {t(locale, 'updateNow')}
            </button>
          </span>
        );
      case 'downloading':
        return (
          <span className="animate-pulse" style={{ color: 'var(--accent-cyan)' }}>
            {t(locale, 'updateDownloading')}
          </span>
        );
      case 'done':
        return (
          <span style={{ color: 'var(--accent-green)' }}>
            {t(locale, 'updateReady')}{' · '}
            <button
              onClick={handleRelaunch}
              className="underline cursor-pointer bg-transparent border-none p-0"
              style={{ color: 'var(--accent-green)', fontSize: '10px' }}
            >
              {t(locale, 'updateRestart')}
            </button>
          </span>
        );
      case 'error':
        return <span style={{ color: 'var(--accent-red)' }} title={errorMsg}>{t(locale, 'updateFailed')}</span>;
      default:
        return null;
    }
  };

  return (
    <div
      className="flex-shrink-0"
      style={{ borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-mantle)' }}
    >
      <div className="flex items-center justify-between px-3 py-0.5" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
        <div className="flex items-center gap-3">
          <span>v{APP_VERSION}</span>
          <button
            onClick={handleCheckUpdate}
            disabled={updateStatus === 'checking' || updateStatus === 'downloading'}
            className="cursor-pointer transition-colors duration-150 bg-transparent border-none p-0 disabled:opacity-50 disabled:cursor-default"
            style={{ color: 'var(--text-muted)', fontSize: '10px' }}
          >
            {t(locale, 'checkForUpdates')}
          </button>
          {renderUpdateContent()}
        </div>
      </div>
    </div>
  );
}
