# Platform Settings Documentation

## Overview
The Platform Settings page provides comprehensive system-wide configuration and administrative functions for platform administrators.

## Architecture

### Main Settings Page
- **Location**: `src/features/settings/SettingsPage.tsx`
- **Route**: `/settings`
- **Access**: Platform Admin only

### Components Structure

#### 1. System Configuration Settings
- **File**: `src/components/settings/SystemConfigurationSettings.tsx`
- **Purpose**: System-wide settings, maintenance mode, API limits, performance settings
- **Features**:
  - Maintenance mode toggle with custom message
  - API rate limiting configuration
  - File upload size limits
  - Session timeout settings
  - Security policy configuration
  - Data retention settings

#### 2. Platform Admin Management
- **File**: `src/components/settings/PlatformAdminManagement.tsx`
- **Purpose**: Manage platform administrators, roles, and permissions
- **Features**:
  - View all platform administrators
  - Add/remove platform admins
  - Role and permission management
  - Admin activity monitoring
  - Super admin designation

#### 3. Notification Settings
- **File**: `src/components/settings/NotificationSettings.tsx`
- **Purpose**: Configure system notifications and alerts
- **Features**:
  - Email, SMS, and push notification toggles
  - Alert type configuration (maintenance, security, billing, etc.)
  - Notification frequency settings
  - Admin contact configuration
  - External integrations (Webhook, Slack)

#### 4. User Management
- **File**: `src/components/PlatformUserManagement.tsx` (existing)
- **Purpose**: Manage platform users and organization admins

#### 5. Organization Settings
- **File**: `src/components/PlatformOrganizationSettings.tsx` (existing)
- **Purpose**: Manage organization-specific settings

## Navigation Structure

The settings page uses a tabbed interface with the following sections:

1. **System Config** - System-wide configuration
2. **Platform Admins** - Administrator management
3. **User Management** - User and role management
4. **Notifications** - Alert and notification settings
5. **Organizations** - Organization-specific settings

## Features

### System Configuration
- **Maintenance Mode**: Put system in maintenance with custom message
- **API Limits**: Configure rate limiting and upload sizes
- **Security**: Password policies, 2FA requirements, registration settings
- **Data Management**: Retention policies and backup settings

### Platform Admin Management
- **Admin Overview**: Statistics dashboard for admins
- **Admin Table**: Comprehensive view of all platform administrators
- **Role Management**: Assign different admin roles and permissions
- **Access Control**: Fine-grained permission system

### Notification System
- **Multi-Channel**: Email, SMS, push notifications
- **Alert Types**: Maintenance, security, performance, billing alerts
- **External Integrations**: Webhook and Slack integration
- **Contact Management**: Primary and backup admin contacts

## Security Features

- Platform admin access only
- Comprehensive audit logging (planned)
- Role-based permissions
- Two-factor authentication support
- Session management

## Future Enhancements

1. **Audit Logging**: Track all administrative actions
2. **Advanced Analytics**: System performance metrics
3. **Backup Management**: Automated backup configuration
4. **API Key Management**: Manage external API integrations
5. **Feature Flags**: Enable/disable platform features
6. **Custom Branding**: Platform-wide branding configuration

## Development Notes

- All components use React Suspense for lazy loading
- Mock data is used currently - replace with actual database calls
- Toast notifications for user feedback
- Responsive design for mobile and desktop
- Consistent error handling across all components

## Usage

To access the platform settings:
1. Login as a platform administrator
2. Navigate to `/settings` or click "Settings" in the navigation
3. Use the tabs to navigate between different setting categories
4. Make changes and save using the "Save Settings" buttons

## API Integration

The settings components are designed to integrate with the following database tables (to be created):
- `system_config` - System-wide configuration
- `notification_config` - Notification settings
- `platform_admins` - Platform administrator data
- `audit_logs` - Administrative action logs

Each component includes placeholder methods for database integration that can be replaced with actual Supabase calls.