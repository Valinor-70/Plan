# Homework Planner

A **privacy-first, local-only** homework and task planner designed to help students manage their academic life with powerful analytics and insights—completely free, no cloud required.

![Homework Planner Landing](https://github.com/user-attachments/assets/bbc70c4a-534f-4d20-b2fc-13214344de33)

## ✨ Features

### 🔒 Privacy First
- **100% Local Storage**: All your data stays on your device
- **No Cloud Sync**: No servers, no tracking, no external data collection
- **Your Data, Your Control**: Export anytime in standard formats

### 📊 Smart Analytics
- **Completion Rate Tracking**: Monitor your productivity trends
- **Task Velocity**: See how many tasks you complete per day
- **Subject Performance**: Compare completion rates across subjects
- **Priority Distribution**: Visualize your task priorities
- **Time Analysis**: Track estimated vs actual time spent
- **Streak Tracking**: Build consistent study habits

### 📅 Comprehensive Planning
- **Task Management**: Create, organize, and track assignments
- **Subject Organization**: Color-coded subjects with custom schedules
- **Calendar Views**: Visualize deadlines and recurring tasks
- **Smart Reminders**: Never miss a due date
- **Priority Levels**: Urgent, High, Medium, and Low priorities

### 🎨 Beautiful UI
- **Modern Design**: Clean, intuitive interface
- **Dark Mode**: Easy on the eyes during late-night study sessions
- **Responsive**: Works perfectly on desktop, tablet, and mobile
- **Smooth Animations**: Powered by Framer Motion

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Valinor-70/Plan.git
cd Plan
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:4321`

### Building for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
/
├── public/
│   ├── sample-data/           # Sample tasks and subjects
│   └── og-image.png            # Open Graph image
├── src/
│   ├── components/
│   │   ├── astro/              # Astro components (Header, Sidebar)
│   │   ├── islands/            # React islands (Dashboard, Analytics, etc.)
│   │   └── ui/                 # Reusable UI components
│   ├── layouts/                # Page layouts
│   ├── lib/
│   │   ├── analytics/          # Analytics computation and insights
│   │   ├── config/             # App configuration (routes)
│   │   ├── store/              # Zustand state management
│   │   ├── types/              # TypeScript types
│   │   └── utils/              # Utility functions
│   ├── pages/                  # Astro pages
│   └── styles/                 # Global styles
└── package.json
```

## 🛠️ Tech Stack

- **Framework**: [Astro](https://astro.build/) - Static site generator
- **UI Library**: [React](https://react.dev/) - Component library
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) - Lightweight state
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- **Charts**: [Recharts](https://recharts.org/) - Composable charting library
- **Date Handling**: [date-fns](https://date-fns.org/) - Modern date utility
- **Animations**: [Framer Motion](https://www.framer.com/motion/) - Animation library
- **Icons**: [Lucide React](https://lucide.dev/) - Beautiful icons

## 📊 Analytics

### Privacy-First Analytics
Analytics are **disabled by default** and can be enabled in Settings. When enabled:
- All computation happens **locally** in your browser
- No data is sent to external servers
- Metrics are computed from your task history
- You can disable analytics at any time

### Available Metrics
- **Completion Rate**: Percentage of completed tasks with trend analysis
- **Velocity**: Average tasks completed per day (30-day rolling)
- **Subject Performance**: Completion rates by subject
- **Priority Distribution**: Visual breakdown of task priorities
- **Time Accuracy**: How well you estimate task duration
- **Streaks**: Current and longest completion streaks
- **Insights**: AI-generated recommendations based on your patterns

## 🎯 Usage

### First-Time Setup
1. Visit the landing page at `/`
2. Click "Get Started" to begin onboarding
3. Choose your theme (Light, Dark, or Auto)
4. Optionally load sample data to explore features
5. Review privacy information
6. Start planning!

### Creating Tasks
1. Click the "Add Task" button in the header
2. Fill in task details (title, subject, due date, priority)
3. Optionally add estimated duration, subtasks, and tags
4. Save and track your progress

### Managing Subjects
1. Navigate to Subjects from the sidebar
2. Create subjects with custom colors
3. Add class schedules and teacher information
4. View tasks organized by subject

### Viewing Analytics
1. Enable analytics in Settings
2. Navigate to Analytics from the sidebar
3. View comprehensive metrics and insights
4. Get personalized recommendations

## 🔧 Configuration

### Routes
All routes are centralized in `src/lib/config/routes.ts`:
- `/` - Landing page
- `/dashboard` - Main dashboard
- `/calendar` - Calendar view
- `/tasks` - Task list
- `/subjects` - Subject management
- `/analytics` - Analytics and insights
- `/settings` - User settings
- `/setup` - Onboarding flow

### Settings
User settings are stored locally and include:
- **Theme**: Light, Dark, or Auto
- **Date Format**: MM/DD/YYYY, DD/MM/YYYY, or YYYY-MM-DD
- **Time Format**: 12h or 24h
- **First Day of Week**: Sunday or Monday
- **Default Priority**: Task priority presets
- **Analytics**: Enable/disable analytics
- **Notifications**: Reminder preferences

## 📦 Data Management

### Export Data
1. Go to Settings
2. Click "Export Data"
3. Download JSON file with all your tasks and subjects

### Import Data
1. Go to Settings
2. Click "Import Data"
3. Select a previously exported JSON file

### Backup Recommendations
- Export your data regularly
- Store backups in a safe location
- Remember: Data is stored in browser localStorage
- Clearing browser data will delete your tasks

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [Astro](https://astro.build/)
- UI inspired by modern SaaS applications
- Icons from [Lucide](https://lucide.dev/)

## 📧 Support

For questions, issues, or feature requests, please open an issue on GitHub.

---

Made with ❤️ for students who want to stay organized and productive.
