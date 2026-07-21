# Matrimonial Module — Technical Documentation
**Meri Samaj | Version 1.0.0 | July 2026**

---

## 1. Overview

The Matrimonial Module enables community members to create verified matrimonial profiles, discover compatible matches, send/receive interest requests, communicate through a real-time chat system, and subscribe to premium plans.

**Roles supported:** `member`, `head`, `admin`, `super_admin`

---

## 2. Architecture

```
Backend (Node.js / Express / MongoDB)
├── Models
│   ├── MatrimonialProfile       — Core profile data
│   ├── MatrimonialInterest      — Interest requests between members
│   ├── MatrimonialSettings      — Platform-wide configurable settings
│   ├── SubscriptionPlan         — Available premium plans
│   ├── UserSubscription         — Per-user subscription records
│   ├── Conversation             — Shared chat conversation (matrimonial scope)
│   ├── Message                  — Chat messages (polymorphic)
│   └── UserNotification         — Centralized cross-module notifications
│
├── Controllers
│   ├── matrimonial/
│   │   ├── matrimonialProfileController.js
│   │   ├── matrimonialInterestController.js
│   │   ├── matrimonialSubscriptionController.js
│   │   ├── matrimonialChatController.js
│   │   ├── matrimonialPhotoController.js
│   │   ├── matrimonialDashboardController.js
│   │   └── matrimonialModerationController.js
│   ├── notificationController.js
│   ├── admin/adminMatrimonialController.js
│   └── head/headMatrimonialController.js
│
├── Middleware
│   ├── matrimonialPrivacy.js    — Strips private fields based on interest status
│   ├── subscriptionGate.js      — Enforces subscription requirements
│   ├── authMiddleware.js        — JWT auth + role-based access
│   └── uploadMiddleware.js      — Multer + Cloudinary photo handling
│
├── Services
│   ├── paymentService.js        — Razorpay / Manual gateway abstraction
│   └── notificationService.js  — Centralized notification creation & delivery
│
├── Routes
│   ├── /api/v1/member/matrimonial/*
│   ├── /api/v1/admin/matrimonial/*
│   └── /api/v1/head/matrimonial/*
│
└── Socket.io
    └── matrimonialSocket.js     — Real-time events for chat and interest notifications

Frontend (React + Vite)
├── src/modules/member/pages/matrimonial/
│   ├── MatrimonialSetupPage.jsx      — Profile creation & editing
│   ├── MatrimonialSearchPage.jsx     — Search with filters
│   ├── MatrimonialProfilePage.jsx    — View user profile
│   ├── InterestsPage.jsx             — All interest tabs
│   ├── MatrimonialShortlistPage.jsx  — Saved profiles
│   ├── MatrimonialChatPage.jsx       — Real-time chat
│   └── MatrimonialSubscriptionPage.jsx — Plans & payment
├── src/modules/admin/pages/matrimonial/   — Admin panel
├── src/modules/head/pages/matrimonial/    — Head panel
└── src/modules/member/pages/notifications/ — Notification center
```

---

## 3. Data Models

### MatrimonialProfile
```js
{
  userId:              ObjectId (ref: User, unique),
  status:              'active' | 'inactive' | 'hidden' | 'banned',
  verificationStatus:  'unverified' | 'pending' | 'verified' | 'rejected',
  verificationNote:    String,
  
  personal: {
    fullName, gender, dateOfBirth, height, weight,
    maritalStatus, religion, caste, gotra, community,
    bloodGroup, disabilities, dietaryHabits, smokingHabits, drinkingHabits
  },
  education: {
    highestQualification, college, graduationYear,
    profession, occupation, company, annualIncome
  },
  family: {
    fatherName, fatherOccupation, motherName, motherOccupation,
    brothers, sisters, familyType, familyValues, familyStatus, nativePlace
  },
  horoscope: {
    gotra, nakshatram, rashi, manglik, birthPlace, birthTime
  },
  location: { city, state, country, pincode },
  about: { biography, partnerExpectations },
  preferences: {
    ageMin, ageMax, heightMin, heightMax,
    education, occupation, community, city, maritalStatus
  },
  privacy: {
    visibility: 'public' | 'community' | 'private',
    showContactAfterInterest: Boolean,
    showPhotoToAll: Boolean
  },
  photos: [{
    url, publicId, isPrimary, status: 'pending'|'approved'|'rejected'
  }],
  subscription: {
    isActive: Boolean, planId: ObjectId, expiresAt: Date,
    interestsUsedToday: Number, contactsUnlockedThisMonth: Number
  },
  profileCompletion: { percentage: Number, completedSections: [String] },
  age: Number (virtual),
  matchScore: Number (computed),
  communityId: ObjectId
}
```

### MatrimonialInterest
```js
{
  senderId:    ObjectId (ref: User),
  receiverId:  ObjectId (ref: User),
  senderProfileId:   ObjectId,
  receiverProfileId: ObjectId,
  status: 'pending' | 'accepted' | 'declined' | 'withdrawn',
  message: String,
  respondedAt: Date,
  createdAt: Date
}
```

### SubscriptionPlan
```js
{
  name, description, price, originalPrice, durationInDays,
  isActive, isMostPopular, displayOrder,
  features: {
    interestsPerDay,     // -1 = unlimited
    photoUploadLimit,
    contactsPerMonth,    // -1 = unlimited
    canChat,
    profileBoost
  }
}
```

### UserSubscription
```js
{
  userId, planId, planName, pricePaid, durationInDays,
  featuresSnapshot: Object,  // copy of plan features at purchase time
  paymentId, paymentGateway, paymentStatus,
  startDate, endDate,
  status: 'active' | 'expired' | 'cancelled' | 'grace',
  cancelledAt, cancelReason
}
```

### UserNotification (centralized)
```js
{
  userId: ObjectId,
  type: String,           // e.g. 'matrimonial_interest', 'announcement'
  module: String,         // e.g. 'matrimonial', 'events'
  title: String,
  message: String,
  referenceType: String,  // e.g. 'MatrimonialInterest'
  referenceId: ObjectId,
  isRead: Boolean,
  createdAt: Date
}
```

---

## 4. API Reference

### Base URL: `http://localhost:5000/api/v1`
### Auth: `Authorization: Bearer <JWT_TOKEN>`

#### Member — Profile
| Method | Path | Description |
|--------|------|-------------|
| POST | `/member/matrimonial/profile` | Create profile |
| GET | `/member/matrimonial/profile/me` | Get my profile |
| PUT | `/member/matrimonial/profile` | Update profile |
| GET | `/member/matrimonial/profile/:id` | Get profile by ID (privacy-gated) |
| GET | `/member/matrimonial/profile/search` | Search with filters |
| DELETE | `/member/matrimonial/profile` | Delete profile |

#### Member — Photos
| Method | Path | Description |
|--------|------|-------------|
| POST | `/member/matrimonial/profile/photos/upload` | Upload photos (multipart) |
| GET | `/member/matrimonial/profile/photos/all` | Get all my photos |
| PUT | `/member/matrimonial/profile/photos/:id/primary` | Set as primary |
| DELETE | `/member/matrimonial/profile/photos/:id` | Delete photo |

#### Member — Interests
| Method | Path | Description |
|--------|------|-------------|
| POST | `/member/matrimonial/interests/send` | Send interest |
| POST | `/member/matrimonial/interests/accept/:id` | Accept interest |
| POST | `/member/matrimonial/interests/decline/:id` | Decline interest |
| DELETE | `/member/matrimonial/interests/:id` | Withdraw interest |
| GET | `/member/matrimonial/interests/received` | Received interests |
| GET | `/member/matrimonial/interests/sent` | Sent interests |
| GET | `/member/matrimonial/interests/accepted` | Accepted matches |

#### Member — Subscription
| Method | Path | Description |
|--------|------|-------------|
| GET | `/member/matrimonial/subscription/plans` | List available plans |
| GET | `/member/matrimonial/subscription/me` | Get my active subscription |
| GET | `/member/matrimonial/subscription/history` | Get billing history |
| POST | `/member/matrimonial/subscription/purchase` | Initiate Razorpay order |
| POST | `/member/matrimonial/subscription/verify` | Verify payment & activate |
| POST | `/member/matrimonial/subscription/cancel` | Cancel subscription |

#### Member — Chat
| Method | Path | Description |
|--------|------|-------------|
| GET | `/member/matrimonial/chat/conversations` | List conversations |
| GET | `/member/matrimonial/chat/:profileId/messages` | Get messages |
| POST | `/member/matrimonial/chat/:profileId/messages` | Send message |
| DELETE | `/member/matrimonial/chat/messages/:msgId` | Delete message |
| PUT | `/member/matrimonial/chat/:profileId/read` | Mark conversation read |

#### Member — Dashboard & Misc
| Method | Path | Description |
|--------|------|-------------|
| GET | `/member/matrimonial/dashboard` | Dashboard data |
| GET | `/member/matrimonial/shortlist` | Get shortlist |
| POST | `/member/matrimonial/shortlist/:id` | Add to shortlist |
| PUT | `/member/matrimonial/shortlist/:id` | Update shortlist notes |
| DELETE | `/member/matrimonial/shortlist/:id` | Remove from shortlist |
| POST | `/member/matrimonial/block` | Block user |
| DELETE | `/member/matrimonial/block/:id` | Unblock user |
| POST | `/member/matrimonial/report` | Report profile |

#### Member — Notifications
| Method | Path | Description |
|--------|------|-------------|
| GET | `/member/notifications` | Get all notifications |
| GET | `/member/notifications/unread` | Get unread count |
| PUT | `/member/notifications/:id/read` | Mark one as read |
| PUT | `/member/notifications/read-all` | Mark all as read |
| DELETE | `/member/notifications/:id` | Delete one |
| DELETE | `/member/notifications` | Clear all |

#### Admin — Matrimonial
| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/matrimonial/stats` | Platform-wide stats |
| GET | `/admin/matrimonial/analytics` | Engagement analytics |
| GET | `/admin/matrimonial/profiles` | All profiles (paginated) |
| PUT | `/admin/matrimonial/profiles/:id/verify` | Verify/reject profile |
| GET | `/admin/matrimonial/photos/pending` | Pending photos |
| PUT | `/admin/matrimonial/photos/:profileId/:photoId` | Approve/reject photo |
| GET | `/admin/matrimonial/reports` | All reports |
| PUT | `/admin/matrimonial/reports/:id` | Action a report |
| GET/POST/PUT/DELETE | `/admin/matrimonial/plans*` | Plan CRUD |
| POST | `/admin/matrimonial/plans/grant` | Grant free subscription |
| GET/PUT | `/admin/matrimonial/settings` | Platform settings |

#### Head — Matrimonial
| Method | Path | Description |
|--------|------|-------------|
| GET | `/head/matrimonial/stats` | Community stats |
| GET | `/head/matrimonial/profiles` | Community profiles |
| PUT | `/head/matrimonial/profiles/:id/verify` | Verify profile |
| GET | `/head/matrimonial/reports` | Community reports |
| PUT | `/head/matrimonial/reports/:id` | Resolve report |

---

## 5. Business Rules

### Profile
- One matrimonial profile per user (enforced at DB level with unique index on userId)
- Profile visibility controlled by `privacy.visibility`: `public` | `community` | `private`
- Private profiles only visible after interest acceptance
- Profile completion calculated across sections (personal, education, family, photos, preferences)
- Photos moderated by admin before approval

### Interest Flow
```
PENDING → ACCEPTED → Chat unlocked
        → DECLINED
        → WITHDRAWN (by sender, before acceptance)
```
- Interest limits enforced based on subscription plan (free: 3/day)
- Cannot send interest to blocked users or if already blocked by them
- Notifications sent on send, accept, decline

### Subscription & Payment
```
User selects plan → initiatePurchase → Razorpay order created
→ Razorpay checkout → payment completed → verifyAndActivate
→ UserSubscription created → featuresSnapshot stored → notifications sent
```
- Subscription features checked via `subscriptionGate.js` middleware
- In development: `simulatedPayment: true` bypasses signature verification
- In production: only genuine Razorpay signatures accepted

### Privacy Middleware
`matrimonialPrivacy.js` strips sensitive fields based on viewer relationship:
- **Public** profiles: basic info shown to all
- **Community** profiles: visible only to same-community members
- **Private** profiles: only accepted interest parties see full profile
- **Contact details**: only revealed after interest is accepted
- **Subscription required**: contact details need active premium plan

### Notifications
All notifications go through `UserNotification` collection with:
- `type`: event-specific (e.g. `matrimonial_interest`)
- `module`: module name (e.g. `matrimonial`)
- `referenceType` + `referenceId`: links to the triggering document

---

## 6. Socket.io Events

**Server** → `matrimonialSocket.js` attached to global io instance.

| Event | Direction | Payload |
|-------|-----------|---------|
| `join_matrimonial` | client → server | `{ userId }` |
| `matrimonial_message` | client → server | `{ receiverProfileId, content, type }` |
| `matrimonial_message` | server → client | Full message object |
| `matrimonial_typing` | client → server | `{ receiverProfileId, isTyping }` |
| `matrimonial_typing` | server → client | `{ senderProfileId, isTyping }` |
| `matrimonial_interest` | server → client | Interest notification object |
| `matrimonial_interest_accepted` | server → client | Updated interest |
| `matrimonial_read` | client → server | `{ conversationId }` |
| `matrimonial_read` | server → client | `{ conversationId, readAt }` |

**Room naming convention:** `matrimonial_user_${userId}`

---

## 7. Frontend Components

### Hooks
| Hook | File | Purpose |
|------|------|---------|
| `useMatrimonialProfile` | `src/hooks/useMatrimonialProfile.js` | Load/update profile |
| `useInterests` | `src/hooks/useInterests.js` | Interest actions with optimistic UI |
| `useMatrimonialChat` | `src/hooks/useMatrimonialChat.js` | Socket.io chat with REST fallback |

### Services
| Service | Exports | Purpose |
|---------|---------|---------|
| `matrimonialService.js` | `matrimonialProfileService`, `matrimonialInterestService`, `matrimonialSubscriptionService`, `matrimonialChatService`, `matrimonialShortlistService`, `matrimonialModerationService`, `notificationService` | All member API calls |
| Admin `matrimonialService.js` | `matrimonialService` | Admin panel API calls |
| Head `headMatrimonialService.js` | `headMatrimonialService` | Head panel API calls |

### Notification Bell
`NotificationBell` component polls `/member/notifications/unread` every 60 seconds and displays a live badge. Integrated into `PageHeader` via `showBell` prop.

---

## 8. Environment Variables

```env
# Backend
PORT=5000
MONGO_URI=mongodb://...
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_razorpay_secret

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

NODE_ENV=development   # Use 'production' to block simulatedPayment

# Frontend (.env)
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_...
```

---

## 9. Deployment

### Backend (Node.js)
```bash
cd backend
npm install
npm start        # production
npm run dev      # development with nodemon
```

### Frontend (React/Vite)
```bash
cd frontend
npm install
npm run dev      # development server
npm run build    # production build → dist/
```

### Razorpay Production Checklist
1. Set `NODE_ENV=production` on backend server
2. Replace `rzp_test_*` keys with live `rzp_live_*` keys
3. Set up Razorpay webhook for payment verification (optional, for robustness)
4. Test payment flow end-to-end in staging before go-live

---

## 10. Known Issues & Limitations

| Item | Status |
|------|--------|
| Bundle size (3.9MB) | Acceptable for v1 — code splitting recommended for v2 |
| Razorpay dev mode uses simulatedPayment | Production-safe — blocked by NODE_ENV check |
| Pre-existing dynamic import warnings | Non-blocking — affect only bundle chunking, not functionality |
| Photo moderation polling | Manual refresh required — SSE/WebSocket push recommended for v2 |

---

*Generated: July 2026 | Meri Samaj Matrimonial Module*
