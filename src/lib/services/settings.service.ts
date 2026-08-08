import { createClient } from '@/lib/supabase/client';

export interface StoreSettings {
  store_name: string;
  tagline: string;
  helpline_mobile: string;
  whatsapp_number: string;
  gstin: string;
  announcement_banner: string;
}

const DEFAULT_SETTINGS: StoreSettings = {
  store_name: 'Vaily Pyro Park',
  tagline: 'Sivakasi Direct Fireworks Outlet',
  helpline_mobile: '+91 98401 23456',
  whatsapp_number: '919840123456',
  gstin: '33AAACV1234A1Z5',
  announcement_banner: '⚡ DIWALI PRE-BOOKING OPEN: Get up to 75% OFF Factory Direct Rates!',
};

export class SettingsService {
  private static getSupabase() {
    return createClient();
  }

  /**
   * Fetch all store settings as a typed object.
   * Falls back to DEFAULT_SETTINGS if DB unavailable.
   */
  static async getAllSettings(): Promise<StoreSettings> {
    try {
      const supabase = this.getSupabase();
      const { data, error } = await supabase
        .from('store_settings')
        .select('key, value');

      if (error || !data || data.length === 0) {
        console.warn('Settings fetch failed, using defaults:', error?.message);
        return { ...DEFAULT_SETTINGS };
      }

      const settingsMap: Record<string, string> = {};
      data.forEach((row: { key: string; value: string }) => {
        settingsMap[row.key] = row.value;
      });

      return {
        store_name: settingsMap['store_name'] ?? DEFAULT_SETTINGS.store_name,
        tagline: settingsMap['tagline'] ?? DEFAULT_SETTINGS.tagline,
        helpline_mobile: settingsMap['helpline_mobile'] ?? DEFAULT_SETTINGS.helpline_mobile,
        whatsapp_number: settingsMap['whatsapp_number'] ?? DEFAULT_SETTINGS.whatsapp_number,
        gstin: settingsMap['gstin'] ?? DEFAULT_SETTINGS.gstin,
        announcement_banner: settingsMap['announcement_banner'] ?? DEFAULT_SETTINGS.announcement_banner,
      };
    } catch (e) {
      console.warn('Settings fetch exception, using defaults:', e);
      return { ...DEFAULT_SETTINGS };
    }
  }

  /**
   * Save all store settings to the database using upsert.
   * Each key-value pair is upserted atomically.
   */
  static async saveAllSettings(settings: StoreSettings): Promise<boolean> {
    const supabase = this.getSupabase();
    const rows = Object.entries(settings).map(([key, value]) => ({
      key,
      value: String(value),
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('store_settings')
      .upsert(rows, { onConflict: 'key' });

    if (error) {
      console.error('Failed to save settings:', error);
      throw new Error(error.message || 'Failed to save store settings.');
    }
    return true;
  }

  /**
   * Update a single setting value.
   */
  static async saveSetting(key: keyof StoreSettings, value: string): Promise<boolean> {
    const supabase = this.getSupabase();
    const { error } = await supabase
      .from('store_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

    if (error) {
      console.error(`Failed to save setting [${key}]:`, error);
      throw new Error(error.message);
    }
    return true;
  }
}
