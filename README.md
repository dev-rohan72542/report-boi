# 📊 Report Tracker - Life Progress Monitoring App

A comprehensive web application for tracking daily activities, setting goals, and generating detailed reports to monitor your life progress. Built with modern web technologies and designed for both desktop and mobile users.

![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.9-38B2AC?style=for-the-badge&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-Open%20Source%20Backend-3ECF8E?style=for-the-badge&logo=supabase)

## ✨ Features

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

### 📱 **Responsive Design**
- Mobile-first approach
- Cross-platform compatibility
- Touch-friendly interface
- Adaptive navigation

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework

### **UI Components**
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library
- **React Hook Form** - Performant forms with validation
- **Zod** - TypeScript-first schema validation

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
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dev-rohan72542/report-boi.git
   cd report-boi
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
report-boi/
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication pages
│   │   ├── login/         # Login page
│   │   ├── sign-up/       # Registration page
│   │   └── sign-up-success/ # Success confirmation
│   ├── dashboard/         # Main dashboard
│   │   ├── analytics/     # Analytics and charts
│   │   ├── goals/         # Goal management
│   │   ├── profile/       # User profile
│   │   └── reports/       # Report generation
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/             # Reusable components
│   ├── ui/                # Base UI components
│   ├── daily-entry-form.tsx    # Daily activity form
│   ├── goals-manager.tsx       # Goal management
│   ├── progress-dashboard.tsx  # Progress overview
│   ├── monthly-reports.tsx     # Report components
│   ├── pdf-report-generator.tsx # PDF generation
│   └── theme-switcher.tsx      # Theme toggle
├── lib/                   # Utility libraries
│   ├── supabase/          # Supabase client setup
│   └── utils.ts           # Helper functions
├── hooks/                 # Custom React hooks
├── public/                # Static assets
│   └── fonts/             # Custom fonts
└── scripts/               # Database scripts
    ├── 001_create_life_tracking_schema.sql
    ├── 002_create_profile_trigger.sql
    └── 003_create_updated_at_triggers.sql
```

## 🔧 Available Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint

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

## 📱 Mobile Support

- **Responsive design** - Works on all screen sizes
- **Touch-friendly** - Optimized for mobile devices
- **Progressive Web App** - Installable on mobile devices
- **Offline support** - Basic functionality without internet

## 🚀 Deployment

### **Vercel (Recommended)**
1. Connect your GitHub repository to Vercel
2. Add environment variables
3. Deploy automatically on every push

### **Other Platforms**
- Netlify
- Railway
- Self-hosted options

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js team** for the amazing framework
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

