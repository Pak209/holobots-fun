# 🛠 Dev Access System Implementation

## Overview
The Dev Access system restricts visibility of the **Sync Points test branch** to specific users, allowing you to test features before they're available to all users.

## 🔧 Implementation Details

### Database Changes
- **New Field**: `is_dev_account` (boolean, default: false) added to `profiles` table
- **Migration**: `20250120_add_dev_access.sql` 
- **Index**: Performance index on `is_dev_account` for fast lookups

### Frontend Components
1. **Hook**: `useDevAccess()` - Check if current user has dev access
2. **Hook**: `useDevAccessInfo()` - Get dev access info with user details
3. **Component**: `DevAccessWrapper` - Conditional rendering with dev badge
4. **Component**: `DevOnly` - Simple conditional wrapper
5. **Component**: `DevSwitcher` - Show different content for dev vs normal users

### Type Updates
- **UserProfile**: Added `isDevAccount?: boolean`
- **Database mapping**: Updated to include `is_dev_account` field
- **Supabase types**: Updated profiles table types

## 🚀 Usage Examples

### Basic Dev-Only Content
```tsx
import { DevOnly } from '@/components/DevAccessWrapper';

<DevOnly>
  <SyncPointsTestComponent />
</DevOnly>
```

### Dev vs Normal Content
```tsx
import { DevSwitcher } from '@/components/DevAccessWrapper';

<DevSwitcher
  devContent={<SyncPointsTestUI />}
  normalContent={<ComingSoonMessage />}
/>
```

### Full Page with Dev Badge
```tsx
import { DevAccessWrapper } from '@/components/DevAccessWrapper';

<DevAccessWrapper fallback={<ComingSoonPage />}>
  <SyncPointsTestFeatures />
</DevAccessWrapper>
```

### Check Dev Access in Logic
```tsx
import { useDevAccess } from '@/hooks/useDevAccess';

function MyComponent() {
  const hasDevAccess = useDevAccess();
  
  if (hasDevAccess) {
    // Show test features
  }
}
```

## 🔐 Setting Up Dev Access

### 1. Apply Database Migration
```bash
# If using local Supabase
npx supabase db reset

# Or apply migration manually to production
# See: supabase/migrations/20250120_add_dev_access.sql
```

### 2. Set Dev Account for pak209
```sql
-- After pak209 creates their account, run:
UPDATE profiles 
SET is_dev_account = TRUE 
WHERE username = 'pak209' OR email = 'dkimoto@yahoo.com';

-- Verify:
SELECT id, username, email, is_dev_account 
FROM profiles 
WHERE is_dev_account = TRUE;
```

### 3. Manual Setup Script
Use the provided `setup-dev-account.sql` file for manual database setup.

## 🎯 Current Implementation

### Fitness Page
- **Dev Users**: See full Sync Points test interface with tabs (Steps, Sync Training, Upgrades)
- **Normal Users**: See "Coming Soon" message with feature preview
- **Dev Badge**: Shows "🛠 Dev Mode Active" badge for dev users

### Features Restricted to Dev Access
- `SyncPointsInput` component
- `SyncPointsDashboard` component  
- `SyncTrainingInput` component
- All Sync Points test functionality

## 🔍 Visual Indicators

### Dev Mode Badge
- **Location**: Fixed top-right corner
- **Style**: Orange badge with pulse animation
- **Text**: "🛠 Dev Mode Active"
- **When**: Shows automatically for dev users

### Coming Soon Page
- **For**: Non-dev users accessing restricted features
- **Content**: Feature preview and upcoming capabilities
- **Style**: Consistent with app design

## 📱 Platform Compatibility

The system works with both:
- **React Web**: Current implementation
- **React Native**: Same hooks and components will work

## 🔧 Adding New Dev Features

### 1. Wrap Components
```tsx
import { DevOnly } from '@/components/DevAccessWrapper';

<DevOnly>
  <YourNewTestFeature />
</DevOnly>
```

### 2. Update Pages
```tsx
import { DevAccessWrapper } from '@/components/DevAccessWrapper';

<DevAccessWrapper fallback={<ComingSoonMessage />}>
  <TestFeaturePage />
</DevAccessWrapper>
```

### 3. Conditional Logic
```tsx
import { useDevAccess } from '@/hooks/useDevAccess';

const hasDevAccess = useDevAccess();
if (hasDevAccess) {
  // Enable test features
}
```

## 📋 Checklist for New Dev Features

- [ ] Wrap UI components with `DevOnly` or `DevAccessWrapper`
- [ ] Add fallback content for normal users
- [ ] Test with both dev and non-dev accounts
- [ ] Ensure dev badge appears correctly
- [ ] Document new dev-only features

## 🛡️ Security Notes

- **Client-side only**: This is UI-level restriction, not security
- **Backend validation**: Add server-side checks for sensitive operations
- **Production ready**: Safe to deploy, non-dev users won't see test features

## 🎮 Testing

### Test Dev Access
1. Set `is_dev_account = true` for test user
2. Login and verify dev badge appears
3. Check dev-only features are visible

### Test Normal Access  
1. Set `is_dev_account = false` for test user
2. Login and verify no dev badge
3. Check fallback content appears

## 📞 Support

For questions about the Dev Access system:
- Check component documentation in `/src/components/DevAccessWrapper.tsx`
- Review hook implementation in `/src/hooks/useDevAccess.ts`
- See example usage in `/src/pages/Fitness.tsx` 