import { useState, useEffect, useCallback } from 'react';
import { fetch } from '@tauri-apps/plugin-http';
import { useAppStore } from '../../stores/useAppStore';
import { t } from '../../lib/i18n';
import { saveSetting } from '../../hooks/useSettings';

export default function SettingsModal() {
  const settingsOpen = useAppStore((s) => s.settingsOpen);
  const aiConfig = useAppStore((s) => s.aiConfig);
  const setAIConfig = useAppStore((s) => s.setAIConfig);
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen);
  const locale = useAppStore((s) => s.locale);

  const [baseUrl, setBaseUrl] = useState(aiConfig.baseUrl);
  const [apiKey, setApiKey] = useState(aiConfig.apiKey);
  const [model, setModel] = useState(aiConfig.model);
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'failed'>('idle');

  // Sync form fields when modal opens or aiConfig changes
  useEffect(() => {
    if (settingsOpen) {
      setBaseUrl(aiConfig.baseUrl);
      setApiKey(aiConfig.apiKey);
      setModel(aiConfig.model);
      setShowKey(false);
      setTestStatus('idle');
    }
  }, [settingsOpen, aiConfig]);

  const handleClose = useCallback(() => {
    setSettingsOpen(false);
  }, [setSettingsOpen]);

  // Close on Escape
  useEffect(() => {
    if (!settingsOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [settingsOpen, handleClose]);

  const handleTestConnection = async () => {
    if (!baseUrl || !apiKey) {
      setTestStatus('failed');
      return;
    }
    setTestStatus('loading');
    try {
      const res = await fetch(`${baseUrl}/models`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (res.ok) {
        setTestStatus('success');
      } else {
        setTestStatus('failed');
      }
    } catch {
      setTestStatus('failed');
    }
  };

  const handleSave = async () => {
    const config = { baseUrl, apiKey, model };
    setAIConfig(config);
    await saveSetting('aiBaseUrl', baseUrl);
    await saveSetting('aiApiKey', apiKey);
    await saveSetting('aiModel', model);
    handleClose();
  };

  if (!settingsOpen) return null;

  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--bg-base)',
    border: '1px solid var(--border-subtle)',
    color: 'var(--text-primary)',
    borderRadius: 4,
    padding: '6px 8px',
    width: '100%',
    outline: 'none',
    fontSize: 12,
  };

  const labelStyle: React.CSSProperties = {
    color: 'var(--text-secondary)',
    fontSize: 12,
    marginBottom: 4,
    display: 'block',
  };

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--bg-mantle)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 8,
          width: 400,
          padding: 24,
        }}
      >
        {/* Title */}
        <div style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, marginBottom: 20 }}>
          {t(locale, 'aiSettings')}
        </div>

        {/* Base URL */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>{t(locale, 'aiBaseUrl')}</label>
          <input
            type="text"
            list="ai-base-url-presets"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://api.openai.com/v1"
            style={inputStyle}
          />
          <datalist id="ai-base-url-presets">
            <option value="https://api.openai.com/v1" />
            <option value="https://api.deepseek.com/v1" />
            <option value="https://api.moonshot.cn/v1" />
          </datalist>
        </div>

        {/* API Key */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>{t(locale, 'aiApiKey')}</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              style={{ ...inputStyle, paddingRight: 32 }}
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              style={{
                position: 'absolute',
                right: 6,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                fontSize: 14,
                padding: 2,
                lineHeight: 1,
              }}
            >
              {showKey ? '\u{1F441}' : '\u{1F441}\u{200D}\u{1F5E8}'}
            </button>
          </div>
        </div>

        {/* Model */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>{t(locale, 'aiModel')}</label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="gpt-4o"
            style={inputStyle}
          />
        </div>

        {/* Test Connection */}
        <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={handleTestConnection}
            className="px-2 py-0.5 text-xs rounded hover:opacity-80"
            style={{
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-base)',
              cursor: 'pointer',
            }}
          >
            {t(locale, 'aiTestConnection')}
          </button>
          {testStatus === 'loading' && (
            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>...</span>
          )}
          {testStatus === 'success' && (
            <span style={{ color: '#a6e3a1', fontSize: 12 }}>{t(locale, 'aiTestSuccess')}</span>
          )}
          {testStatus === 'failed' && (
            <span style={{ color: '#f38ba8', fontSize: 12 }}>{t(locale, 'aiTestFailed')}</span>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            onClick={handleClose}
            className="px-3 py-1 text-xs rounded hover:opacity-80"
            style={{
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              background: 'none',
              cursor: 'pointer',
            }}
          >
            {t(locale, 'aiCancel')}
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1 text-xs rounded hover:opacity-80"
            style={{
              color: '#fff',
              backgroundColor: 'var(--accent)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {t(locale, 'aiSave')}
          </button>
        </div>
      </div>
    </div>
  );
}
