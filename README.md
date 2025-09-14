# 📊 Report Tracker - Life Progress Monitoring App

A comprehensive, offline-first, cross-platform application for tracking daily activities, setting goals, and generating detailed reports to monitor your life progress. Built with modern web technologies and available for Android and the web.

![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Capacitor](https://img.shields.io/badge/Capacitor-5-blue?style=for-the-badge&logo=capacitor)
![Android](https://img.shields.io/badge/Android-Lollipop%2B-3DDC84?style=for-the-badge&logo=android)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.9-38B2AC?style=for-the-badge&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-Open%20Source%20Backend-3ECF8E?style=for-the-badge&logo=supabase)

## ✨ Features

### 📱 **Android & Web Application**
- **Cross-Platform:** Single codebase for both Android and web.
- **Native Experience:** Access to native device features through Capacitor.
- **Responsive Design:** Fully responsive UI for all screen sizes.

### ⚡ **Offline-First & Synchronization**
- **Work Offline:** Continue to use the app even without an internet connection.
- **Local Storage:** Data is stored locally in an IndexedDB database.
- **Automatic Sync:** Data is automatically synchronized with the cloud when an internet connection is available.

### 🎯 **Goal Management**
- Set and track multiple life goals
- Progress visualization with charts and metrics
- Goal completion tracking and reminders
- Customizable goal categories and priorities

### 📝 **Daily Entry System**
- Quick daily activity logging
- Mood and productivity tracking
- Time-based activity categorization
- Rich text and media support

### 📊 **Analytics Dashboard**
- Comprehensive progress overview
- Interactive charts and graphs
- Performance metrics and trends
- Historical data analysis

### 📋 **Report Generation**
- Monthly progress reports
- PDF export functionality
- Customizable report templates
- Data visualization and insights

### 🔐 **Authentication & Security**
- Secure user authentication
- Role-based access control
- Data privacy protection
- Session management

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework

### **Mobile**
- **Capacitor 5** - Cross-platform native runtime for web apps.

### **UI Components**
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library
- **React Hook Form** - Performant forms with validation
- **Zod** - TypeScript-first schema validation

### **Data & State Management**
- **IndexedDB** - Browser-based database for offline storage.
- **Dexie.js** - A wrapper for IndexedDB to make it easier to use.
- **React Query** - For data fetching, caching, and synchronization.

### **Data Visualization**
- **Recharts** - Composable charting library
- **React PDF Renderer** - PDF generation capabilities

### **Backend & Database**
- **Supabase** - Open-source Firebase alternative
- **PostgreSQL** - Robust relational database
- **Real-time subscriptions** - Live data updates

### **Development Tools**
- **ESLint** - Code quality and consistency
- **PostCSS** - CSS processing and optimization
- **Autoprefixer** - CSS vendor prefixing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- Java 17 (for Android development)
- Android Studio (for Android development)
- Supabase account

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/dev-rohan72542/report-boi.git
    cd report-boi
    ```

2.  **Install dependencies**
    ```bash
    pnpm install
    # or
    npm install
    ```

3.  **Set up environment variables**
    Create a `.env.local` file in the root directory:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
    ```

4.  **Run the development server**
    ```bash
    pnpm dev
    # or
    npm run dev
    ```

5.  **Open your browser**
    Navigate to [http://localhost:3000](http://localhost:3000)

### Running on Android

1.  **Build the web assets**
    ```bash
    pnpm build
    ```

2.  **Sync the web assets with the Android project**
    ```bash
    npx cap sync android
    ```

3.  **Open the Android project in Android Studio**
    ```bash
    npx cap open android
    ```

4.  **Run the app**
    Click the "Run" button in Android Studio to run the app on an emulator or a connected device.

## 📁 Project Structure

```
report-boi/
├── android/                # Android native project
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/             # Reusable components
│   ├── ui/                # Base UI components
│   └── ...
├── lib/                    # Utility libraries
│   ├── database/          # IndexedDB (Dexie.js) setup
│   ├── services/          # Data services
│   ├── supabase/          # Supabase client setup
│   ├── sync/              # Data synchronization logic
│   └── utils.ts           # Helper functions
├── hooks/                  # Custom React hooks
├── public/                 # Static assets
└── scripts/                # Database scripts
```

## 🔧 Available Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint

# Capacitor
npx cap sync android # Sync web assets with Android project
npx cap open android # Open Android project in Android Studio

# Database
# Run the SQL scripts in scripts/ folder to set up your database
```

## 🎨 Customization

### **Themes**
- Light and dark mode support
- Custom color schemes
- Responsive design breakpoints

### **Fonts**
- Multiple Bengali font options
- Unicode support for international users
- Custom font loading

### **Components**
- Modular component architecture
- Easy to customize and extend
- Consistent design system

## 🚀 Deployment

### **Vercel (for Web)**
1.  Connect your GitHub repository to Vercel
2.  Add environment variables
3.  Deploy automatically on every push

### **Google Play Store (for Android)**
1.  Generate a signed APK or App Bundle in Android Studio.
2.  Create a new app in the Google Play Console.
3.  Upload your app bundle and fill in the required information.

## 🤝 Contributing

1.  Fork the repository
2.  Create a feature branch (`git checkout -b feature/amazing-feature`)
3.  Commit your changes (`git commit -m 'Add amazing feature'`)
4.  Push to the branch (`git push origin feature/amazing-feature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js team** for the amazing framework
- **Capacitor team** for making cross-platform development easier
- **Supabase team** for the open-source backend
- **Radix UI** for accessible components
- **Tailwind CSS** for the utility-first approach

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/dev-rohan72542/report-boi/issues)
- **Discussions**: [GitHub Discussions](https://github.com/dev-rohan72542/report-boi/discussions)
- **Email**: [Your Email]

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/dev-rohan72542">dev-rohan72542</a></p>
  <p>⭐ Star this repository if you found it helpful!</p>
</div>