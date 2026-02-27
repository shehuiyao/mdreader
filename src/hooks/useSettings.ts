import { Store } from '@tauri-apps/plugin-store';

// Settings structure
export interface Settings {
  previewFontSize?: number;
  aiBaseUrl?: string;
  aiApiKey?: string;
  aiModel?: string;
}

// Store instance (lazy-loaded)
let store: Store | null = null;

/**
 * Get or create the store instance
 */
async function getStore(): Promise<Store> {
  if (!store) {
    store = await Store.load('settings.json');
  }
  return store;
}

/**
 * Load settings from Tauri Store
 * @returns Settings object with defaults for missing values
 */
export async function loadSettings(): Promise<Settings> {
  try {
    const storeInstance = await getStore();
    const previewFontSize = await storeInstance.get<number>('previewFontSize');
    const aiBaseUrl = await storeInstance.get<string>('aiBaseUrl');
    const aiApiKey = await storeInstance.get<string>('aiApiKey');
    const aiModel = await storeInstance.get<string>('aiModel');
    return {
      previewFontSize: previewFontSize ?? 16, // default 16px
      aiBaseUrl: aiBaseUrl ?? '',
      aiApiKey: aiApiKey ?? '',
      aiModel: aiModel ?? '',
    };
  } catch (error) {
    console.warn('Failed to load settings, using defaults:', error);
    return {
      previewFontSize: 16,
    };
  }
}

/**
 * Save a setting to Tauri Store
 * @param key - Setting key
 * @param value - Setting value
 */
export async function saveSetting(key: keyof Settings, value: unknown): Promise<void> {
  try {
    const storeInstance = await getStore();
    await storeInstance.set(key, value);
    await storeInstance.save();
  } catch (error) {
    console.error(`Failed to save setting ${key}:`, error);
  }
}
