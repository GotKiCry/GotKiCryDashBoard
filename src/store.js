import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
    persist(
        (set) => ({
            shortcuts: [
                { id: '1', title: 'Google', url: 'https://google.com' },
                { id: '2', title: 'YouTube', url: 'https://youtube.com' },
                { id: '3', title: 'GitHub', url: 'https://github.com' },
                { id: '4', title: 'Bilibili', url: 'https://bilibili.com' },
            ],
            settings: {
                theme: 'auto', // 'light', 'dark', 'auto'
                use24Hour: true,
                glassOpacity: 0.1,
                weather: {
                    mode: 'auto', // 'auto' or 'manual'
                    city: 'Local',
                    lat: null,
                    lon: null,
                }
            },
            addShortcut: (shortcut) => set((state) => ({
                shortcuts: [...state.shortcuts, { ...shortcut, id: crypto.randomUUID() }]
            })),
            removeShortcut: (id) => set((state) => ({
                shortcuts: state.shortcuts.filter(s => s.id !== id)
            })),
            updateShortcut: (id, data) => set((state) => ({
                shortcuts: state.shortcuts.map(s => s.id === id ? { ...s, ...data } : s)
            })),
            setShortcuts: (shortcuts) => set({ shortcuts }),
            updateSettings: (newSettings) => set((state) => ({
                settings: { ...state.settings, ...newSettings }
            })),
            updateWeatherConfig: (config) => set((state) => ({
                settings: {
                    ...state.settings,
                    weather: { ...state.settings.weather, ...config }
                }
            })),
        }),
        {
            name: 'chrome-dash-storage',
        }
    )
);
