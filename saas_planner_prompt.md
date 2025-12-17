# GPT 5.2 Coder Max - Advanced SaaS Homework Planner Build Prompt

## Project Overview
Build a production-grade, static-first SaaS homework and task planner web application using Astro.js with React islands. This is a premium student productivity platform that combines sophisticated design, advanced features, and exceptional user experience. The application should rival commercial products like Notion, Todoist, and Google Calendar in polish and functionality.

---

## Core Technical Architecture

### Technology Stack
- **Framework**: Astro 4.x with SSG (Static Site Generation)
- **Interactive Islands**: React 18+ with TypeScript
- **Styling**: Tailwind CSS 3.x with custom design system
- **State Management**: Zustand for cross-island state synchronization
- **Data Persistence**: Browser localStorage with IndexedDB fallback for large datasets
- **Date Handling**: date-fns or Day.js for date manipulation
- **Animations**: Framer Motion for micro-interactions
- **Icons**: Lucide React (consistent, modern icon set)
- **Build Tool**: Vite (built into Astro)

### Project Structure
```
/src
  /pages
    index.astro                 # Dashboard/home
    calendar.astro              # Full calendar view
    subjects.astro              # Subject management
    analytics.astro             # Progress analytics
    settings.astro              # User preferences
  /components
    /islands (React with client directives)
      TaskForm.tsx
      TaskList.tsx
      TaskCard.tsx
      CalendarView.tsx
      SubjectManager.tsx
      FilterSidebar.tsx
      StatsDashboard.tsx
      QuickAddModal.tsx
      BulkActions.tsx
      SearchBar.tsx
    /ui (Shared UI components)
      Button.tsx
      Input.tsx
      Select.tsx
      Modal.tsx
      Dropdown.tsx
      Card.tsx
      Badge.tsx
      Toast.tsx
    /astro (Static components)
      Header.astro
      Sidebar.astro
      Footer.astro
      Navigation.astro
  /layouts
    MainLayout.astro
    DashboardLayout.astro
  /lib
    /store
      taskStore.ts              # Zustand store
      subjectStore.ts
      settingsStore.ts
    /utils
      dateHelpers.ts
      storage.ts
      filters.ts
      analytics.ts
      export.ts
    /types
      index.ts                  # TypeScript interfaces
  /styles
    global.css
    themes.css
/public
  /fonts
  /images
```

---

## Design System & Visual Identity

### Color Palette (Modern SaaS Aesthetic)
**Primary Colors:**
- Brand Primary: `#6366f1` (Indigo-500) - Main actions, links
- Brand Secondary: `#8b5cf6` (Violet-500) - Accents, highlights
- Brand Tertiary: `#06b6d4` (Cyan-500) - Success states, info

**Semantic Colors:**
- Success: `#10b981` (Emerald-500)
- Warning: `#f59e0b` (Amber-500)
- Error: `#ef4444` (Red-500)
- Info: `#3b82f6` (Blue-500)

**Neutral Palette:**
- Background: `#fafafa` (Light), `#0f172a` (Dark)
- Surface: `#ffffff` (Light), `#1e293b` (Dark)
- Border: `#e5e7eb` (Light), `#334155` (Dark)
- Text Primary: `#0f172a` (Light), `#f1f5f9` (Dark)
- Text Secondary: `#64748b`
- Text Tertiary: `#94a3b8`

### Typography
- **Font Family**: 
  - Headings: Inter Variable (700, 600, 500)
  - Body: Inter Variable (400, 500)
  - Monospace: JetBrains Mono (for dates, numbers)
- **Scale**: 
  - Display: 48px/56px
  - H1: 36px/44px (font-semibold)
  - H2: 30px/36px (font-semibold)
  - H3: 24px/32px (font-medium)
  - H4: 20px/28px (font-medium)
  - Body Large: 18px/28px
  - Body: 16px/24px
  - Body Small: 14px/20px
  - Caption: 12px/16px

### Spacing System (8px base unit)
- xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, 2xl: 48px, 3xl: 64px

### Border Radius
- sm: 6px, md: 8px, lg: 12px, xl: 16px, 2xl: 24px, full: 9999px

### Shadows (Layered depth)
- sm: `0 1px 2px 0 rgb(0 0 0 / 0.05)`
- md: `0 4px 6px -1px rgb(0 0 0 / 0.1)`
- lg: `0 10px 15px -3px rgb(0 0 0 / 0.1)`
- xl: `0 20px 25px -5px rgb(0 0 0 / 0.1)`

### Design Principles
- **Minimalist**: Clean, uncluttered interface with plenty of whitespace
- **Depth**: Subtle shadows and elevation for visual hierarchy
- **Fluid**: Smooth transitions and animations (200ms ease-in-out standard)
- **Responsive**: Mobile-first, tablet-optimized, desktop-enhanced
- **Accessible**: WCAG 2.1 AA compliant minimum
- **Modern Glass**: Subtle backdrop blur effects on modals and overlays
- **Micro-interactions**: Hover states, button presses, loading states all animated

---

## Data Models & TypeScript Interfaces

### Task Interface
```typescript
interface Task {
  id: string;                    // UUID v4
  title: string;                 // Required, 1-200 chars
  description: string;           // Optional, rich text supported
  subjectId: string;             // Foreign key to Subject
  dueDate: Date;                 // Required
  dueTime?: string;              // Optional time HH:MM
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in-progress' | 'completed' | 'archived';
  tags: string[];                // Custom user tags
  estimatedDuration?: number;    // Minutes
  actualDuration?: number;       // Minutes
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  attachments?: Attachment[];    // URLs or file references
  subtasks?: SubTask[];
  recurring?: RecurringPattern;
  reminderBefore?: number;       // Minutes before due
  customFields?: Record<string, any>;
}

interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}

interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;              // Every X days/weeks/months
  endDate?: Date;
  daysOfWeek?: number[];         // 0-6 for weekly
}
```

### Subject Interface
```typescript
interface Subject {
  id: string;
  name: string;                  // e.g., "Mathematics", "Biology"
  color: string;                 // Hex color
  icon?: string;                 // Lucide icon name
  teacher?: string;
  room?: string;
  schedule?: ClassSchedule[];
  creditHours?: number;
  semester?: string;
  archived: boolean;
  createdAt: Date;
}

interface ClassSchedule {
  dayOfWeek: number;            // 0-6
  startTime: string;            // HH:MM
  endTime: string;              // HH:MM
}
```

### User Settings Interface
```typescript
interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  accentColor: string;
  defaultView: 'list' | 'calendar' | 'kanban' | 'timeline';
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  firstDayOfWeek: 0 | 1;        // Sunday or Monday
  defaultTaskDuration: number;   // Minutes
  defaultPriority: Task['priority'];
  notifications: {
    enabled: boolean;
    before: number[];            // Minutes before due
    sound: boolean;
  };
  sortBy: 'dueDate' | 'priority' | 'subject' | 'createdAt';
  groupBy: 'none' | 'subject' | 'priority' | 'status';
  showCompletedTasks: boolean;
  compactMode: boolean;
  language: string;
}
```

---

## Feature Specifications

### 1. Dashboard (Homepage)
**Layout:**
- Top navigation bar with logo, search, quick add, notifications, profile
- Left sidebar with navigation (Dashboard, Calendar, Subjects, Analytics, Settings)
- Main content area with widgets
- Right sidebar with upcoming tasks and quick filters

**Widgets (Grid Layout, Draggable/Reorderable):**
1. **Today's Tasks** - All tasks due today with completion checkboxes
2. **Upcoming Deadlines** - Next 7 days in timeline format
3. **Priority Tasks** - Urgent and high-priority items
4. **Subject Overview** - Cards showing tasks per subject
5. **Productivity Streak** - Days with completed tasks
6. **Quick Stats** - Completion rate, overdue count, total tasks
7. **Recent Activity** - Last 10 actions with timestamps
8. **Study Time Tracker** - Logged study hours per subject

**Interactive Elements:**
- Drag-and-drop task reordering
- Inline task editing
- Quick complete/uncomplete toggles
- Right-click context menus
- Keyboard shortcuts (display in help modal)

### 2. Task Management System

**Task Creation (Quick Add + Full Form):**
- **Quick Add Modal** (Cmd/Ctrl+K):
  - Single input with smart parsing: "Math homework #urgent due tomorrow 2pm"
  - Autocomplete for subjects and tags
  - Date picker with natural language ("today", "next monday", "in 3 days")
  - Priority quick select (icon buttons)
  - Submit with Enter, close with Esc

- **Full Task Form** (Detailed modal):
  - Title (large input)
  - Rich text description (basic formatting: bold, italic, lists, links)
  - Subject dropdown with search
  - Date picker (calendar widget)
  - Time picker (optional)
  - Priority selector (visual buttons with icons)
  - Tags input (multi-select with creation)
  - Estimated duration slider (15min - 8hrs)
  - Recurring task options (expandable section)
  - Reminder settings (multiple reminders allowed)
  - Subtask builder (add/remove dynamically)
  - Attachment upload (drag-and-drop area)
  - Color label picker
  - Custom fields (extensible key-value pairs)

**Task Display (Multiple Views):**
1. **List View** (Default):
   - Grouped by: Subject / Priority / Date / Status
   - Sortable columns
   - Bulk selection checkboxes
   - Expandable task rows for details
   - Inline editing on click
   - Color-coded left border by subject
   - Priority indicator badges
   - Due date with relative time ("in 2 hours", "tomorrow")
   - Progress bar for subtasks
   - Hover: Show quick actions (edit, delete, duplicate, move)

2. **Kanban Board**:
   - Columns: To Do, In Progress, Completed, Archived
   - Drag-and-drop between columns
   - WIP limits (optional)
   - Swimlanes by subject (optional)
   - Card includes: title, subject chip, due date, priority

3. **Calendar View**:
   - Month/Week/Day views
   - Color-coded events by subject
   - Multi-day tasks shown as bars
   - Click date to create task
   - Drag to reschedule
   - Hover preview with task details
   - Today indicator (highlighted)

4. **Timeline View** (Gantt-style):
   - Horizontal bars showing task duration
   - Dependencies visualization (arrows between tasks)
   - Milestones markers
   - Critical path highlighting
   - Zoom controls (day/week/month granularity)

**Task Actions:**
- Complete/Uncomplete (checkbox animation)
- Edit (modal or inline)
- Duplicate (with confirmation)
- Delete (with undo toast)
- Move to different subject
- Change priority (quick picker)
- Reschedule (date picker)
- Archive (hide from main views)
- Add to favorites (pin to top)
- Share task (copy link)
- Export task (JSON, markdown)

**Bulk Actions:**
- Select multiple tasks (shift-click range selection)
- Bulk complete/uncomplete
- Bulk delete with confirmation
- Bulk change priority
- Bulk move to subject
- Bulk reschedule
- Bulk tag application

### 3. Filtering & Search System

**Advanced Filters (Sidebar Panel):**
- **Subject**: Multi-select dropdown with checkboxes
- **Priority**: All/Urgent/High/Medium/Low toggle group
- **Status**: To Do/In Progress/Completed/Archived
- **Date Range**: Custom picker, presets (Today, This Week, Next 7 Days, This Month, Custom)
- **Tags**: Multi-select with search
- **Has Subtasks**: Toggle
- **Overdue Only**: Toggle
- **Has Attachments**: Toggle
- **Recurring Tasks**: Toggle
- **Estimated Duration**: Range slider (0-480 min)
- **Completion Rate**: Slider for tasks with subtasks

**Save Filter Presets:**
- Save current filter combination
- Name and icon selection
- Quick access in sidebar
- Edit/Delete saved filters

**Search Bar (Global):**
- Fuzzy search across: title, description, tags, subject names
- Search syntax: 
  - `#tag` for tags
  - `@subject` for subjects
  - `priority:high` for priority
  - `due:today` for dates
- Real-time results dropdown
- Keyboard navigation
- Recent searches history
- Search suggestions

### 4. Subject/Class Management

**Subject Cards (Grid Layout):**
- Subject name with icon
- Color indicator strip
- Task count badge (active/total)
- Completion percentage ring chart
- Quick actions: Edit, Archive, View Tasks

**Subject Creation Form:**
- Name (required)
- Color picker (preset palette + custom)
- Icon selector (searchable icon library)
- Teacher name
- Room/Location
- Schedule builder:
  - Add multiple class times per week
  - Day selector (multi-select)
  - Start/End time pickers
  - Visual schedule preview
- Credit hours
- Semester/Term
- Notes field

**Subject Detail View:**
- All tasks for this subject (filterable)
- Upcoming assignments timeline
- Completed vs. Total progress chart
- Average task completion time
- Most used tags for this subject
- Schedule calendar integration

### 5. Calendar Integration

**Full Calendar Page:**
- Month/Week/Day/Agenda views (tab navigation)
- Mini calendar sidebar for quick navigation
- Task list sidebar for selected date
- Color-coded by subject (legend shown)
- Click to add task
- Drag to reschedule
- Double-click to edit
- Keyboard navigation (arrows, Enter, Esc)
- Print view option
- Export to iCal format

**Month View:**
- Grid layout
- Multiple tasks per day (stacked)
- Overflow indicator ("+ 3 more")
- Hover preview
- Today highlighted
- Weekend styling distinction

**Week View:**
- Time-slotted grid (hourly)
- All-day events at top
- Timed tasks in time slots
- Current time indicator line
- Working hours highlighting

**Day View:**
- Detailed hourly schedule
- Class schedule overlay (from subjects)
- Time blocking visualization
- Free time calculation
- Suggested study blocks

### 6. Analytics & Insights Dashboard

**Key Metrics (Card Grid):**
1. **Completion Rate**:
   - Percentage with trend arrow
   - Sparkline chart (last 30 days)
   - This week vs. last week comparison

2. **Task Velocity**:
   - Tasks completed per day average
   - Line chart over time
   - Productivity score (calculated)

3. **Subject Performance**:
   - Horizontal bar chart
   - Completion rate per subject
   - Color-coded bars

4. **Priority Distribution**:
   - Donut chart
   - Urgent/High/Medium/Low breakdown
   - Pending vs. completed

5. **Time Analysis**:
   - Estimated vs. actual duration comparison
   - Accuracy score
   - Time saved/overspent

6. **Streak Tracker**:
   - Current streak in days
   - Longest streak record
   - GitHub-style contribution graph

**Charts & Visualizations:**
- **Task Completion Trend**: Line chart (last 3 months)
- **Study Hours by Subject**: Stacked bar chart (weekly)
- **Deadline Distribution**: Calendar heatmap
- **Peak Productivity Times**: Heatmap by hour of day
- **Tag Cloud**: Frequency-based sizing
- **Upcoming Workload**: Projection chart (next 4 weeks)

**Insights Panel (AI-like suggestions):**
- "You complete most tasks on Tuesday afternoons"
- "Math assignments take 30% longer than estimated"
- "You have 5 assignments due next week"
- "Your completion rate improved 15% this month"

### 7. Settings & Customization

**Appearance:**
- Theme toggle (Light/Dark/Auto)
- Accent color picker (affects buttons, links, highlights)
- Font size adjustment (sm/md/lg)
- Compact mode toggle (reduce spacing)
- Animation preferences (reduce motion for accessibility)

**Preferences:**
- Default view selection
- Date and time format
- First day of week
- Default task duration
- Default priority level
- Auto-archive completed tasks (after X days)
- Show weekends toggle

**Notifications:**
- Enable/disable notifications
- Reminder timings (15min, 30min, 1hr, 1day before)
- Sound toggle
- Browser notification permission

**Data Management:**
- Export all data (JSON format)
- Import data (with validation)
- Clear all data (with confirmation)
- Backup reminder
- Storage usage indicator

**Keyboard Shortcuts:**
- Displayed in table format
- Customizable (advanced feature)
- Cheat sheet (printable)
- Common shortcuts:
  - `Cmd/Ctrl + K`: Quick add task
  - `Cmd/Ctrl + F`: Search
  - `C`: Mark complete
  - `E`: Edit task
  - `D`: Delete task
  - `N`: New task
  - `Esc`: Close modal
  - `Arrow keys`: Navigate
  - `/`: Focus search

---

## Advanced Features

### 1. Smart Scheduling Assistant
- Analyze free time in calendar
- Suggest optimal study blocks
- Consider task priority and estimated duration
- Factor in class schedule
- Balance workload across days
- Avoid scheduling conflicts

### 2. Focus Mode
- Full-screen single task view
- Pomodoro timer integration (25/5 min cycles)
- Distractions blocked (hide other tasks)
- Progress tracking during session
- Session history logging
- Break reminders

### 3. Collaboration Features (Future-proof structure)
- Share individual tasks (read-only link)
- Subject collaboration (shared class notes)
- Group projects (multi-user tasks)
- Comments on tasks
- @mentions for team members

### 4. Template System
- Save tasks as templates
- Common assignment templates (Essay, Lab Report, Reading)
- Pre-filled fields
- Quick template application
- Template library with categories

### 5. Data Visualization
- Export charts as PNG
- Weekly email summary (HTML generation)
- Print-friendly reports
- PDF export of schedules

### 6. Smart Defaults
- Learn user patterns (most common subjects, typical durations)
- Pre-fill based on history
- Suggest tags based on task title
- Autocomplete subject names

### 7. Undo/Redo System
- Global undo/redo for all actions
- Action history (last 50 actions)
- Undo toast notifications
- Keyboard shortcuts (Cmd/Ctrl + Z, Cmd/Ctrl + Shift + Z)

---

## User Experience Requirements

### Loading States
- Skeleton screens for initial load
- Spinner for async operations
- Progress bars for multi-step processes
- Optimistic UI updates (instant feedback)

### Empty States
- Friendly illustrations
- Helpful prompts ("Create your first task!")
- Quick action buttons
- Onboarding tips

### Error Handling
- Graceful degradation
- Clear error messages
- Suggested fixes
- Retry mechanisms
- Toast notifications for non-critical errors
- Modal dialogs for critical errors

### Responsive Design Breakpoints
- Mobile: < 640px (single column, bottom navigation)
- Tablet: 640px - 1024px (two columns, collapsed sidebar)
- Desktop: 1024px - 1280px (full layout)
- Large Desktop: > 1280px (expanded layout, more widgets)

### Mobile Optimizations
- Touch-friendly tap targets (44x44px minimum)
- Swipe gestures (swipe to complete, swipe to delete)
- Bottom navigation bar
- Pull-to-refresh
- Mobile-first form designs
- Reduced animations

### Accessibility Features
- ARIA labels on all interactive elements
- Keyboard navigation throughout
- Focus indicators (visible focus ring)
- Screen reader announcements
- High contrast mode support
- Font scaling support
- Reduced motion respect
- Color blind friendly palette
- Alt text for all images

### Performance Targets
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse Score: > 90
- Bundle size: < 200KB (gzipped)
- Lazy load non-critical components
- Code splitting by route
- Image optimization (WebP with fallbacks)

---

## Component Implementation Details

### Button Component
```typescript
// Props: variant, size, icon, loading, disabled, onClick, children
// Variants: primary, secondary, ghost, danger, success
// Sizes: sm, md, lg
// States: default, hover, active, disabled, loading
// Animation: scale on click, ripple effect
```

### Modal Component
```typescript
// Props: open, onClose, title, size, children, footer
// Sizes: sm (400px), md (600px), lg (800px), xl (1000px), full
// Features: backdrop blur, close on escape, close on backdrop click
// Animation: fade in/out with scale
// Trap focus inside modal
// Return focus to trigger element on close
```

### Toast Notification System
```typescript
// Types: success, error, warning, info
// Position: top-right, top-center, bottom-right, bottom-center
// Auto-dismiss after 4s (configurable)
// Manual dismiss (X button)
// Stack multiple toasts
// Undo action in toast (for destructive actions)
```

### Date Picker Component
```typescript
// Calendar grid with month/year navigation
// Highlighted: today, selected date, due date
// Quick presets: Today, Tomorrow, Next Week, etc.
// Keyboard navigation
// Time picker integration (optional)
// Range selection mode (for reports)
```

### Rich Text Editor
```typescript
// Toolbar: Bold, Italic, Underline, List, Link, Code
// Markdown support (optional)
// Paste handling (clean HTML)
// Character counter
// Auto-save on blur
```

---

## State Management Architecture

### Zustand Store Structure
```typescript
// taskStore.ts - Central task management
interface TaskStore {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  
  // Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  bulkUpdateTasks: (ids: string[], updates: Partial<Task>) => void;
  
  // Selectors
  getTaskById: (id: string) => Task | undefined;
  getTasksBySubject: (subjectId: string) => Task[];
  getTasksByDateRange: (start: Date, end: Date) => Task[];
  getOverdueTasks: () => Task[];
  getUpcomingTasks: (days: number) => Task[];
  
  // Persistence
  loadFromStorage: () => void;
  saveToStorage: () => void;
  exportData: () => string;
  importData: (data: string) => void;
}
```

### Persistence Strategy
- Auto-save on every state change (debounced 500ms)
- Load on app initialization
- Versioned data schema (for migrations)
- Data validation on import
- Backup before destructive operations
- IndexedDB for large datasets (> 1000 tasks)

---

## Animation & Interaction Design

### Micro-interactions
1. **Button Press**: Scale down to 0.95, bounce back
2. **Checkbox Complete**: Checkmark draw animation (SVG stroke)
3. **Task Card Hover**: Lift with shadow increase, border color change
4. **Modal Enter/Exit**: Fade + scale from 0.95 to 1
5. **Toast Notification**: Slide in from right, fade out
6. **Loading Spinner**: Smooth rotation, color pulse
7. **Progress Bar**: Smooth width transition
8. **Drag & Drop**: Item lifts, ghost placeholder, snap animation
9. **Priority Badge**: Pulse on high priority
10. **Calendar Date**: Ripple effect on click

### Page Transitions
- Fade between routes (200ms)
- Slide in for modals (300ms ease-out)
- Content stagger (children animate in sequence)

### Skeleton Screens
- Loading shimmer effect
- Match layout of actual content
- Smooth transition to real content

---

## Code Quality Standards

### TypeScript Requirements
- Strict mode enabled
- No `any` types (use `unknown` if needed)
- Proper interface definitions for all data
- Generic types where appropriate
- Discriminated unions for state variants

### Component Structure
- Functional components only
- Custom hooks for logic reuse
- Props interface for every component
- Default props when applicable
- PropTypes or TypeScript for validation

### Naming Conventions
- Components: PascalCase (TaskCard)
- Files: PascalCase for components, camelCase for utils
- Functions: camelCase (handleSubmit, formatDate)
- Constants: UPPER_SNAKE_CASE (MAX_TASKS, API_URL)
- CSS classes: kebab-case (task-card, btn-primary)

### Code Organization
- One component per file
- Co-locate related files (TaskCard.tsx, TaskCard.test.tsx, TaskCard.module.css)
- Utils in /lib/utils
- Hooks in /lib/hooks
- Types in /lib/types
- Maximum file length: 300 lines

### Comments & Documentation
- JSDoc for public functions
- Inline comments for complex logic
- README for each major directory
- Component props documented
- Example usage in Storybook (optional)

---

## Testing Requirements (For Future Implementation)
- Unit tests for utility functions
- Component tests with React Testing Library
- Integration tests for user flows
- E2E tests with Playwright
- Accessibility tests with axe
- Visual regression tests
- Performance budgets

---

## Deployment & Build

### Build Configuration
```javascript
// astro.config.mjs
export default defineConfig({
  output: 'static',
  integrations: [
    react(),
    tailwind(),
  ],
  vite: {
    optimizeDeps: {
      exclude: ['lucide-react']
    }
  },
  build: {
    inlineStylesheets: 'auto',
  },
  compressHTML: true,
})
```

### SEO & Meta Tags
- Semantic HTML5 structure
- Open Graph tags
- Twitter Card tags
- Canonical URLs
- Sitemap generation
- Robots.txt

### Performance Optimizations
- Image lazy loading
- Component lazy loading
- Route-based code splitting
- CSS purging (Tailwind)
- Tree shaking
- Minification
- Gzip compression
- CDN-ready assets

---

## Additional Requirements

### Browser Support
- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- Mobile Safari: iOS 13+
- Chrome Android: Last 2 versions

### Progressive Web App (PWA) Features
- Service worker for offline capability
- App manifest (name, icons, theme color)
- Install prompt
- Offline fallback page
- Cache strategies for assets

### Security Considerations
- XSS prevention (sanitize user input)
- CSRF tokens (if adding backend)
- Content Security Policy headers
- Secure localStorage access
- Input validation and sanitization

### Internationalization (i18n) Structure
- Language files structure (/locales/en.json)
- Translation keys throughout app
- RTL layout support preparation
- Date/time localization
- Number formatting localization

---

## Success Criteria

The final application should:
1. **Look Premium**: Indistinguishable from commercial SaaS products
2. **Feel Responsive**: All interactions < 100ms feedback
3. **Be Intuitive**: New users can add a task in < 30 seconds
4. **Handle Scale**: Perform smoothly with 1000+ tasks
5. **Be Accessible**: WCAG 2.1 AA compliant
6. **Mobile Ready**: Full functionality on mobile devices
7. **Be Maintainable**: Clean, documented, well-structured code
8. **Be Extensible**: Easy to add new features
9. **Be Robust**: Graceful error handling throughout
10. **Be Beautiful**: Attention to detail in every pixel

---

## Implementation Priority

### Phase 1 (MVP):
1. Basic task CRUD operations
2. Subject management
3. List view with filtering
4. Simple calendar view
5. Local storage persistence
6. Responsive layout

### Phase 2 (Enhanced):
7. Advanced filtering and search
8. Kanban board view
9. Analytics dashboard
10. Keyboard shortcuts
11. Bulk actions
12. Theme customization

### Phase 3 (Advanced):
13. Timeline/Gantt view
14. Focus mode with timer
15. Smart scheduling
16. Template system
17. Export/import functionality
18. PWA features

---

## Final Notes

This is a comprehensive, production-grade application. Pay extreme attention to:
- **Design consistency** across all screens
- **Animation fluidity** (60fps target)
- **Code quality** (maintainable, readable)
- **User experience** (intuitive, delightful)
- **Performance** (fast, optimized)
- **Accessibility** (inclusive, WCAG compliant)

The end result should be a homework planner that students would happily pay for and use daily. It should feel modern, polished, and professional while being genuinely helpful for academic success.

Create a static site that loads instantly, works offline (PWA), and provides a native-app-like experience. Every interaction should be smooth, every transition should be purposeful, and every pixel should be intentional.

Good luck, and build something amazing! 🚀
