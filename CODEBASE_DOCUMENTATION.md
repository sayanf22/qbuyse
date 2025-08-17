# Qbuyse Marketplace - Complete Codebase Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Core Features](#core-features)
5. [Database Schema](#database-schema)
6. [API Integration](#api-integration)
7. [Component Architecture](#component-architecture)
8. [State Management](#state-management)
9. [Authentication System](#authentication-system)
10. [Real-time Features](#real-time-features)
11. [File Upload System](#file-upload-system)
12. [Search and Filtering](#search-and-filtering)
13. [Mobile Responsiveness](#mobile-responsiveness)
14. [Performance Optimizations](#performance-optimizations)
15. [Security Measures](#security-measures)
16. [Development Setup](#development-setup)
17. [Deployment](#deployment)

## Project Overview

Qbuyse is a comprehensive local marketplace application designed specifically for India, enabling users to buy and sell items within their states. The platform features real-time communication, advanced search capabilities, and a mobile-first design approach.

### Key Characteristics
- **State-wise Marketplace**: Users can filter and browse items by Indian states
- **Dual Post Types**: Support for both "SELL" and "WANT" listings
- **Real-time Communication**: Direct messaging and public discussions
- **Mobile-First Design**: Optimized for mobile devices with responsive UI
- **Category-based Organization**: 16 predefined categories for better organization
- **Image Management**: Support for up to 3 images per post with compression

## Technology Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Type-safe development with strict typing
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality React component library
- **React Router DOM**: Client-side routing
- **TanStack Query**: Server state management and caching
- **Lucide React**: Icon library

### Backend & Services
- **Supabase**: Backend-as-a-Service platform
  - PostgreSQL database with Row Level Security
  - Real-time subscriptions
  - Authentication system
  - File storage
  - Edge functions
- **ImgBB API**: External image hosting service

### Development Tools
- **ESLint**: Code linting and formatting
- **TypeScript ESLint**: TypeScript-specific linting rules
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

## Project Structure

```
qbuyse-master/
├── public/                     # Static assets
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── AuthModal.tsx     # Authentication modal
│   │   ├── BottomNavigation.tsx
│   │   ├── HamburgerMenu.tsx
│   │   ├── Layout.tsx        # Main layout wrapper
│   │   ├── NotificationPanel.tsx
│   │   ├── PostCard.tsx      # Individual post display
│   │   ├── RealTimeChat.tsx  # Chat interface
│   │   ├── SEOHead.tsx       # SEO meta tags
│   │   └── ...
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.tsx       # Authentication context
│   │   ├── useAuthModal.tsx  # Auth modal state
│   │   └── use-toast.ts      # Toast notifications
│   ├── integrations/         # External service integrations
│   │   └── supabase/
│   │       ├── client.ts     # Supabase client configuration
│   │       └── types.ts      # Database type definitions
│   ├── lib/                  # Utility libraries
│   │   └── utils.ts          # Common utility functions
│   ├── pages/                # Page components
│   │   ├── HomePage.tsx      # Main marketplace feed
│   │   ├── PostPage.tsx      # Create/edit posts
│   │   ├── SearchPage.tsx    # Search and filtering
│   │   ├── ChatPage.tsx      # Messaging interface
│   │   ├── ProfilePage.tsx   # User profile management
│   │   └── ...
│   ├── utils/                # Utility functions
│   │   └── categories.ts     # Category definitions
│   ├── App.tsx               # Main application component
│   ├── main.tsx              # Application entry point
│   └── index.css             # Global styles
├── .kiro/                    # Kiro IDE specifications
│   └── specs/
│       └── qbuyse-marketplace/
│           ├── requirements.md
│           ├── design.md
│           └── tasks.md
├── package.json              # Dependencies and scripts
├── tailwind.config.js        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
└── vite.config.ts            # Vite configuration
```

## Core Features

### 1. User Authentication
- **Email/Password Authentication**: Secure login with Supabase Auth
- **Google OAuth**: Social login integration
- **Profile Management**: Username, full name, state, and profile picture
- **Real-time Username Validation**: Checks availability as user types
- **Email Verification**: Required for account activation

### 2. Post Management
- **Create Posts**: Support for SELL and WANT post types
- **Image Upload**: Up to 3 images per post with compression
- **Category Selection**: 16 predefined categories
- **State Selection**: All 29 Indian states supported
- **Edit/Delete**: Post owners can modify or remove their posts
- **Price Management**: Optional pricing for posts

### 3. Marketplace Browsing
- **State-wise Filtering**: Filter posts by Indian states
- **Category Filtering**: Browse by specific categories
- **Post Type Filtering**: Filter by SELL, WANT, or ALL
- **Randomized Display**: Posts shown in random order for fairness
- **Infinite Scroll**: Smooth loading experience

### 4. Search Functionality
- **Text Search**: Search in post titles and descriptions
- **User Search**: Find users by username with @ prefix
- **Advanced Filters**: Type, state, price range filtering
- **People Search**: Search users by name and username
- **Real-time Results**: Instant search results as user types

### 5. Communication System
- **Direct Messaging**: Real-time chat between users
- **Public Discussions**: Comment system on posts
- **Threaded Replies**: Nested comment conversations
- **User Mentions**: @username mentions with notifications
- **Message Status**: Read/unread status tracking

### 6. Notification System
- **Real-time Notifications**: Instant updates for messages and mentions
- **Notification Badge**: Unread count display
- **Notification Panel**: Centralized notification management
- **Auto-refresh**: Real-time updates without page reload

## Database Schema

### Core Tables

#### profiles
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  state TEXT NOT NULL,
  profile_img TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_state_change TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### posts
```sql
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2),
  type TEXT CHECK (type IN ('SELL', 'WANT')) NOT NULL,
  category TEXT NOT NULL,
  state TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### chats
```sql
CREATE TABLE chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### discussions
```sql
CREATE TABLE discussions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  parent_comment_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
  mentions UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### notifications
```sql
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Integration

### Supabase Client Configuration
```typescript
// src/integrations/supabase/client.ts
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

### Key API Patterns

#### Data Fetching with TanStack Query
```typescript
const { data: posts, isLoading, refetch } = useQuery({
  queryKey: ["posts", filter, currentState, selectedCategory],
  queryFn: async (): Promise<Post[]> => {
    const { data, error } = await supabase.rpc('get_posts_with_profiles', {
      p_filter: filterValue,
      p_state: stateValue,
      p_category: selectedCategory,
      p_limit: 50
    });
    if (error) throw error;
    return data || [];
  },
  staleTime: 2 * 60 * 1000,
  gcTime: 5 * 60 * 1000,
});
```

#### Real-time Subscriptions
```typescript
useEffect(() => {
  const channel = supabase
    .channel('posts-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'posts'
    }, () => {
      refetch();
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}, [refetch]);
```

## Component Architecture

### Component Hierarchy
```
App
├── AuthProvider (Context)
├── ThemeProvider (Context)
├── QueryClientProvider (TanStack Query)
├── BrowserRouter
├── Layout
│   ├── SEOHead
│   ├── main (children)
│   └── BottomNavigation
└── Routes
    ├── HomePage
    ├── SearchPage
    ├── PostPage
    ├── ChatPage
    ├── ProfilePage
    └── ...
```

### Key Component Patterns

#### PostCard Component
- **Props Interface**: Strongly typed post data
- **Image Carousel**: Multiple image support with navigation
- **Action Menu**: Edit/delete for post owners
- **Discussion System**: Expandable comment section
- **Real-time Updates**: Live comment and reaction updates

#### AuthModal Component
- **Tab System**: Login and signup in single modal
- **Form Validation**: Real-time validation with error display
- **Username Checking**: Async validation for username availability
- **Social Auth**: Google OAuth integration
- **State Management**: Form state with proper error handling

## State Management

### Authentication State
```typescript
// useAuth hook provides global auth state
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}
```

### Server State Management
- **TanStack Query**: Handles all server state with caching
- **Query Keys**: Structured keys for efficient cache management
- **Optimistic Updates**: Immediate UI updates with rollback
- **Background Refetching**: Automatic data synchronization

### Local State Patterns
- **useState**: Component-level state for UI interactions
- **useEffect**: Side effects and cleanup
- **Custom Hooks**: Reusable stateful logic
- **Context API**: Global state for auth and theme

## Authentication System

### Authentication Flow
1. **User Registration**: Email, password, profile information
2. **Email Verification**: Required before account activation
3. **Profile Creation**: Automatic profile creation with user data
4. **Session Management**: Persistent sessions with auto-refresh
5. **Protected Routes**: Route-level authentication checks

### Security Features
- **Row Level Security**: Database-level access control
- **Password Requirements**: Strong password enforcement
- **Session Validation**: Server-side session verification
- **CSRF Protection**: Built-in CSRF protection with Supabase

## Real-time Features

### WebSocket Connections
- **Supabase Realtime**: WebSocket-based real-time updates
- **Channel Management**: Efficient subscription management
- **Connection Pooling**: Optimized connection usage
- **Automatic Reconnection**: Handles connection drops gracefully

### Real-time Use Cases
1. **Live Chat**: Instant message delivery
2. **Post Updates**: Real-time post creation/deletion
3. **Notifications**: Instant notification delivery
4. **Discussion Updates**: Live comment updates
5. **User Status**: Online/offline status tracking

## File Upload System

### Image Upload Process
1. **Client Validation**: File type and size validation
2. **Image Compression**: Automatic compression to reduce size
3. **Secure Upload**: Upload to Supabase Edge Function
4. **External Storage**: Images stored on ImgBB service
5. **URL Storage**: Image URLs stored in database

### Upload Security
- **File Type Validation**: Only image files allowed
- **Size Limits**: Maximum 5MB per image
- **Virus Scanning**: Server-side security checks
- **Access Control**: User-based upload permissions

## Search and Filtering

### Search Implementation
```typescript
// Multi-field search with PostgreSQL
const searchQuery = supabase
  .from("posts")
  .select("*")
  .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);

// User search with @ prefix
if (searchTerm.startsWith('@')) {
  const username = searchTerm.substring(1);
  const { data: userProfiles } = await supabase
    .from("profiles")
    .select("id")
    .ilike("username", `%${username}%`);
}
```

### Filter System
- **State Filtering**: 29 Indian states with codes
- **Category Filtering**: 16 predefined categories
- **Type Filtering**: SELL, WANT, or ALL posts
- **Price Range**: Minimum and maximum price filters
- **Date Filtering**: Recent posts prioritization

## Mobile Responsiveness

### Design Approach
- **Mobile-First**: Designed primarily for mobile devices
- **Responsive Breakpoints**: Tailwind CSS responsive utilities
- **Touch Interactions**: Optimized for touch interfaces
- **Bottom Navigation**: Mobile-friendly navigation pattern

### Mobile Features
- **Swipe Gestures**: Image carousel navigation
- **Pull-to-Refresh**: Native-like refresh behavior
- **Infinite Scroll**: Smooth content loading
- **Offline Support**: Basic offline functionality
- **PWA Ready**: Progressive Web App capabilities

## Performance Optimizations

### Frontend Optimizations
- **Code Splitting**: Route-based lazy loading
- **Image Optimization**: WebP format with fallbacks
- **Bundle Analysis**: Optimized bundle size
- **Caching Strategy**: Aggressive caching with TanStack Query

### Backend Optimizations
- **Database Indexing**: Optimized query performance
- **Connection Pooling**: Efficient database connections
- **CDN Integration**: Static asset delivery
- **Edge Functions**: Serverless function optimization

### Real-time Performance
- **Subscription Management**: Efficient WebSocket usage
- **Data Synchronization**: Optimistic updates
- **Memory Management**: Proper cleanup
- **Throttling**: Rate limiting for updates

## Security Measures

### Client-Side Security
- **Input Sanitization**: XSS prevention
- **CSRF Protection**: Cross-site request forgery prevention
- **Content Security Policy**: CSP headers implementation
- **Secure Storage**: Secure token storage

### Server-Side Security
- **Row Level Security**: Database access control
- **API Rate Limiting**: Abuse prevention
- **Input Validation**: Server-side validation
- **Authentication Checks**: Proper auth verification

### Data Protection
- **Encryption**: Data encryption at rest and in transit
- **Privacy Controls**: User privacy settings
- **Data Minimization**: Collect only necessary data
- **Audit Logging**: Security event logging

## Development Setup

### Prerequisites
- Node.js 18+ and npm
- Git for version control
- Modern web browser
- Code editor (VS Code recommended)

### Installation Steps
```bash
# Clone the repository
git clone <repository-url>
cd qbuyse-master

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_IMGBB_API_KEY=your_imgbb_api_key
```

## Deployment

### Production Build
```bash
# Create optimized production build
npm run build

# The build output will be in the 'dist' directory
# Deploy the contents of 'dist' to your hosting provider
```

### Deployment Platforms
- **Vercel**: Recommended for React applications
- **Netlify**: Alternative hosting with CI/CD
- **AWS S3 + CloudFront**: Scalable static hosting
- **Firebase Hosting**: Google's hosting solution

### Environment Configuration
- **Production Environment Variables**: Set in hosting platform
- **Database Configuration**: Supabase production instance
- **CDN Setup**: Configure for static assets
- **SSL Certificate**: HTTPS enforcement

## Contributing

### Code Style
- **TypeScript**: Strict typing required
- **ESLint**: Follow configured linting rules
- **Prettier**: Code formatting consistency
- **Component Structure**: Functional components with hooks

### Development Workflow
1. **Feature Branches**: Create feature-specific branches
2. **Code Review**: Pull request review process
3. **Testing**: Write tests for new features
4. **Documentation**: Update documentation for changes

### Best Practices
- **Type Safety**: Use TypeScript interfaces
- **Error Handling**: Comprehensive error handling
- **Performance**: Consider performance implications
- **Accessibility**: Follow WCAG guidelines
- **Security**: Security-first development approach

---

This documentation provides a comprehensive overview of the Qbuyse marketplace codebase. For specific implementation details, refer to the individual component files and the specification documents in the `.kiro/specs/` directory.