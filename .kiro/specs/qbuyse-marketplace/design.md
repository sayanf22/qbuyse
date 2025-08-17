# Design Document

## Overview

Qbuyse is a state-wise local marketplace application designed specifically for the Indian market. The platform facilitates peer-to-peer buying and selling with a focus on local transactions within states. The application follows a mobile-first design approach with a clean, modern interface built using React, TypeScript, and Tailwind CSS, backed by Supabase for real-time data management.

## Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │   Supabase      │    │   External      │
│   (Frontend)    │◄──►│   Backend       │◄──►│   Services      │
│                 │    │                 │    │                 │
│ - React Router  │    │ - PostgreSQL    │    │ - ImgBB API     │
│ - TanStack      │    │ - Auth          │    │ - Email Service │
│   Query         │    │ - Real-time     │    │ - File Storage  │
│ - Tailwind CSS  │    │ - Edge Functions│    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Frontend Architecture

- **Framework**: React 18 with TypeScript for type safety
- **Routing**: React Router DOM for client-side navigation
- **State Management**: TanStack Query for server state, React Context for auth
- **Styling**: Tailwind CSS with shadcn/ui components
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture

- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Authentication**: Supabase Auth with email/password and OAuth
- **Real-time**: Supabase Realtime for live updates
- **File Storage**: Supabase Storage for profile images
- **Edge Functions**: Custom functions for image upload and data processing

## Components and Interfaces

### Core Components

#### 1. Authentication System
```typescript
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}
```

**Components:**
- `AuthProvider`: Context provider for authentication state
- `AuthModal`: Modal for login/signup with tabs
- `ProtectedRoute`: Route wrapper for authenticated pages

#### 2. Post Management System
```typescript
interface Post {
  id: string;
  title: string;
  description: string;
  price: number;
  type: 'SELL' | 'WANT';
  category: string;
  images: string[];
  created_at: string;
  user_id: string;
  state: string;
  profile_full_name?: string;
  profile_username?: string;
  profile_img?: string;
}
```

**Components:**
- `PostCard`: Individual post display with actions
- `PostPage`: Post creation and editing form
- `ImageCarousel`: Multi-image display with navigation

#### 3. Communication System
```typescript
interface Chat {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  post_id?: string;
}

interface Discussion {
  id: string;
  comment: string;
  created_at: string;
  user_id: string;
  post_id: string;
  parent_comment_id?: string;
  mentions: string[];
}
```

**Components:**
- `RealTimeChat`: Direct messaging interface
- `ChatPage`: Chat list and conversation management
- `NotificationPanel`: Real-time notification display

#### 4. Search and Filter System
```typescript
interface SearchFilters {
  query: string;
  type: 'all' | 'items' | 'people';
  postType: 'ALL' | 'SELL' | 'WANT';
  state: string;
  category: string;
  minPrice?: number;
  maxPrice?: number;
}
```

**Components:**
- `SearchPage`: Advanced search with filters
- `FilterPanel`: Collapsible filter options
- `CategoryFilter`: Category selection interface

### UI Component Library

Built on shadcn/ui with custom extensions:

- **Form Components**: Input, Textarea, Select, Checkbox, Button
- **Layout Components**: Dialog, Sheet, Tabs, Carousel
- **Feedback Components**: Toast, Alert, Badge, Tooltip
- **Navigation Components**: BottomNavigation, HamburgerMenu

## Data Models

### Database Schema

#### Users and Profiles
```sql
-- Profiles table (extends Supabase auth.users)
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

#### Posts and Categories
```sql
-- Posts table
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

#### Communication Tables
```sql
-- Chats table
CREATE TABLE chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discussions table
CREATE TABLE discussions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  parent_comment_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
  mentions UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
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

### Category System
```typescript
interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
}

const categories = [
  { id: "Cars", name: "Cars", icon: Car },
  { id: "Properties", name: "Properties", icon: Home },
  { id: "Mobiles", name: "Mobiles", icon: Smartphone },
  { id: "Jobs", name: "Jobs", icon: Briefcase },
  { id: "Fashion", name: "Fashion", icon: Shirt },
  // ... 16 total categories
];
```

### State Management
```typescript
// Indian states with codes for efficient filtering
const indianStates = [
  { name: "All States", code: "ALL" },
  { name: "Andhra Pradesh", code: "AP" },
  { name: "Arunachal Pradesh", code: "AR" },
  // ... all 29 states
];
```

## Error Handling

### Client-Side Error Handling
- **Form Validation**: Real-time validation with user feedback
- **Network Errors**: Retry mechanisms with exponential backoff
- **Image Upload**: File type and size validation with compression
- **Authentication**: Graceful handling of expired sessions

### Server-Side Error Handling
- **Database Constraints**: Proper foreign key and unique constraints
- **Row Level Security**: User-based data access control
- **Rate Limiting**: Protection against abuse
- **Data Validation**: Server-side validation for all inputs

### Error Recovery Strategies
```typescript
// Query error handling with TanStack Query
const { data, error, isLoading, refetch } = useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
  retry: (failureCount, error) => {
    if (error.status === 404) return false;
    return failureCount < 3;
  },
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
});
```

## Testing Strategy

### Unit Testing
- **Component Testing**: React Testing Library for UI components
- **Hook Testing**: Custom hooks with proper mocking
- **Utility Testing**: Pure functions and data transformations
- **Form Validation**: Input validation and error states

### Integration Testing
- **API Integration**: Supabase client integration tests
- **Authentication Flow**: Login/signup process testing
- **Real-time Features**: WebSocket connection testing
- **File Upload**: Image upload and compression testing

### End-to-End Testing
- **User Journeys**: Complete user workflows
- **Cross-browser Testing**: Chrome, Firefox, Safari compatibility
- **Mobile Testing**: Responsive design and touch interactions
- **Performance Testing**: Load times and bundle size optimization

### Testing Tools
- **Jest**: Unit test runner
- **React Testing Library**: Component testing utilities
- **MSW**: API mocking for tests
- **Cypress**: End-to-end testing framework

## Performance Optimizations

### Frontend Optimizations
- **Code Splitting**: Route-based lazy loading
- **Image Optimization**: WebP format with fallbacks
- **Bundle Analysis**: Webpack bundle analyzer
- **Caching Strategy**: Service worker for offline support

### Backend Optimizations
- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: Efficient database connections
- **CDN Integration**: Static asset delivery
- **Edge Functions**: Serverless function optimization

### Real-time Performance
- **Subscription Management**: Efficient WebSocket connections
- **Data Synchronization**: Optimistic updates with rollback
- **Memory Management**: Proper cleanup of subscriptions
- **Throttling**: Rate limiting for real-time updates

## Security Considerations

### Authentication Security
- **Password Requirements**: Strong password enforcement
- **Session Management**: Secure token handling
- **OAuth Integration**: Google OAuth with proper scopes
- **Email Verification**: Required for account activation

### Data Security
- **Row Level Security**: Database-level access control
- **Input Sanitization**: XSS and injection prevention
- **File Upload Security**: Type and size validation
- **API Rate Limiting**: Abuse prevention

### Privacy Protection
- **Data Minimization**: Only collect necessary information
- **User Consent**: Clear privacy policy and terms
- **Data Retention**: Automatic cleanup of old data
- **Anonymization**: Remove PII when appropriate

## Deployment and Infrastructure

### Development Environment
- **Local Development**: Vite dev server with hot reload
- **Environment Variables**: Secure configuration management
- **Database Migrations**: Version-controlled schema changes
- **Testing Pipeline**: Automated testing on commits

### Production Deployment
- **Build Process**: Optimized production builds
- **CDN Distribution**: Global content delivery
- **SSL/TLS**: HTTPS enforcement
- **Monitoring**: Error tracking and performance monitoring

### Scalability Considerations
- **Database Scaling**: Read replicas and connection pooling
- **File Storage**: Distributed storage with CDN
- **Caching Layer**: Redis for session and data caching
- **Load Balancing**: Horizontal scaling capabilities