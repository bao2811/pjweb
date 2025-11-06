# ProfileSettings Component - Usage Examples

## User Profile Page

```tsx
// Path: app/user/profile/page.tsx
import ProfileSettings from "@/components/ProfileSettings";

export default function UserProfilePage() {
  return <ProfileSettings showPushSettings={true} />;
}
```

## Manager Profile Page

```tsx
// Path: app/manager/profile/page.tsx
import ProfileSettings from "@/components/ProfileSettings";

export default function ManagerProfilePage() {
  return <ProfileSettings showPushSettings={true} />;
}
```

## Admin Profile Page

```tsx
// Path: app/admin/profile/page.tsx
import ProfileSettings from "@/components/ProfileSettings";

export default function AdminProfilePage() {
  return <ProfileSettings showPushSettings={true} />;
}
```

## Simple Profile (without Push Settings)

```tsx
// If you don't want push notification settings
import ProfileSettings from "@/components/ProfileSettings";

export default function SimpleProfilePage() {
  return <ProfileSettings showPushSettings={false} />;
}
```

## Features

### Two Tabs

1. **Thông tin cá nhân** - User profile information

   - Avatar display and upload button
   - Name, email, phone, address
   - Role and status badges
   - Edit profile button

2. **Thông báo Push** - Push notification settings
   - Enable/disable push notifications
   - Visual status indicators
   - Helpful information about notifications
   - List of notification types user will receive

### Props

- `showPushSettings` (boolean, optional, default: true)
  - Set to `true` to show push notification tab
  - Set to `false` to hide push notification tab

### Usage Tips

1. **For all user roles**: Use the same component with `showPushSettings={true}`
2. **For simple profile pages**: Use `showPushSettings={false}` to hide notifications tab
3. **Customization**: Modify the component to add more fields as needed

### Styling

The component uses:

- Tailwind CSS for styling
- Responsive design
- Tab-based navigation
- Clean, modern UI with proper spacing
- Status indicators and icons

### Integration with Backend

The component automatically:

- Uses `useUser()` hook to get current user data
- Uses `usePushNotifications()` hook for push subscription
- Handles permission requests
- Saves subscriptions to backend API
- Shows loading and error states
