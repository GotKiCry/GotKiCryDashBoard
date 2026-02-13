# Chrome Personal Navigation Page

> A premium, glassmorphism-styled personal dashboard for your browser.

## 📖 Project Overview
This project is a modern, aesthetically pleasing navigation page designed to replace the default "New Tab" page. It features a deep, dynamic background, frosted glass cards (Glassmorphism), and essential widgets like a search bar and speed dial shortcuts.

**Note on Regional Optimization**: This project is specifically optimized for **Mainland China (CN)**. All integrated APIs (Wallpaper, Weather, Favicons) and font resources are carefully selected to ensure high availability and fast loading speeds within the region without requiring a VPN.

## 🛠 Tech Stack
- **Core Framework**: [React](https://react.dev/) v19
- **Build Tool**: [Vite](https://vitejs.dev/) v7
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Drag & Drop**: [dnd-kit](https://dndkit.com/)
- **Styling**: Vanilla CSS (Variables + Flexbox/Grid)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/)
- **Package Manager**: NPM

## ✨ Key Features
- **Glassmorphism UI**: Uses `backdrop-filter: blur(16px)` and translucent layers for a premium feel.
- **Smart Search Bar**: Default optimization for **Microsoft Bing** (CN-accessible).
- **Speed Dial Grid**: 
    - High-speed favicon loading via iowen.cn provider.
    - **Draggable & Sortable**: Customize your layout with drag-and-drop support.
    - **Context Menu**: Right-click to edit or deeper interactions.
- **Advanced Weather Widget**: 
    - Auto-geolocates or manual search.
    - Displays min/max temperature range.
    - Real-time updates using Open-Meteo.
    - **Customizable Settings**: Configure location and display preferences.
- **Dynamic Bing Background**: 4K resolution, localized for China region (`mkt=zh-CN`).
- **Responsive Design**: Adapts seamlessly to Desktop, Tablet, and Mobile screens.

## 📂 Project Structure
```
GotKiCryDashBoard/
├── dist/                   # Production build output
├── public/                 # Static assets (images, fonts)
├── src/
│   ├── assets/             # Project assets
│   ├── components/         # React Components
│   │   ├── Background.jsx  # Background image handler
│   │   ├── Clock.jsx       # Time & Date widget
│   │   ├── Clock.css       # Styles for Clock
│   │   ├── EditShortcutModal.jsx # Shortcut editing modal
│   │   ├── LinkGrid.jsx    # Speed Dial shortcuts (Draggable)
│   │   ├── LinkGrid.css    # Styles for LinkGrid
│   │   ├── Modal.jsx       # Generic Modal component
│   │   ├── SearchBar.jsx   # Search input component
│   │   ├── SearchBar.css   # Styles for SearchBar
│   │   ├── TopBar.jsx      # Top navigation/status bar
│   │   ├── Weather.jsx     # Weather widget
│   │   ├── Weather.css     # Styles for Weather
│   │   └── WeatherSettings.jsx # Weather configuration
│   ├── hooks/              # Custom React Hooks
│   │   └── useBingWallpaper.js # Hook to fetch Bing wallpaper
│   ├── store.js            # Zustand Global State Store
│   ├── App.jsx             # Main layout component
│   ├── App.css             # Component-specific styles
│   ├── index.css           # Global styles & CSS Variables
│   └── main.jsx            # Entry point
├── index.html              # HTML template
├── package.json            # Dependencies & Scripts
└── vite.config.js          # Vite configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- NPM or Yarn

### Installation
1.  **Clone the repository** (or navigate to the folder):
    ```bash
    cd d:/GitProject/GotKiCryDashBoard
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```

### Development
Start the local development server:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### Production Build
Create a production-ready build:
```bash
npm run build
```
The output will be in the `dist/` directory, ready to be deployed to any static host (Vercel, Netlify, Apache/Nginx).

## ⚙️ Customization

### Adding New Links
1.  Open `src/components/LinkGrid.jsx`.
2.  Add a new object to the `defaultLinks` array:
    ```javascript
    { id: 9, title: 'My Site', url: 'https://mysite.com', icon: <FiGlobe /> },
    ```
3.  Ensure you import the icon from `react-icons/fi` (or other sets).

### Changing Background
1.  Open `src/index.css`.
2.  Modify the `--bg-gradient` variable in the `:root` block:
    ```css
    :root {
      --bg-gradient: linear-gradient(135deg, #myColor1, #myColor2);
    }
    ```

## 📝 License
Private / Personal Use
