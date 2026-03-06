arivuon-lms/
│
├── app/                         # Next.js App Router
│
│   ├── (auth)/                  # authentication routes
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   ├── reset-password/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│
│   ├── (student)/               # student dashboard routes
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── courses/
│   │   │   ├── page.tsx
│   │   │   └── [courseId]/
│   │   │        └── page.tsx
│   │   ├── sessions/
│   │   │   └── page.tsx
│   │   ├── assignments/
│   │   │   └── page.tsx
│   │   ├── attendance/
│   │   │   └── page.tsx
│   │   ├── progress/
│   │   │   └── page.tsx
│   │   ├── leaderboard/
│   │   │   └── page.tsx
│   │   ├── ai-tutor/
│   │   │   └── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│
│   ├── (trainer)/               # trainer routes
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── sessions/
│   │   │   └── page.tsx
│   │   ├── batches/
│   │   │   └── page.tsx
│   │   ├── attendance/
│   │   │   └── page.tsx
│   │   ├── assignments/
│   │   │   └── page.tsx
│   │   ├── analytics/
│   │   │   └── page.tsx
│   │   ├── content/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│
│   ├── (admin)/                 # admin routes
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── users/
│   │   │   └── page.tsx
│   │   ├── courses/
│   │   │   └── page.tsx
│   │   ├── batches/
│   │   │   └── page.tsx
│   │   ├── analytics/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│
│   ├── api/
│   │   └── auth/
│   │        └── route.ts
│
│   ├── layout.tsx               # root layout
│   ├── page.tsx                 # redirect to login
│   ├── not-found.tsx
│   ├── error.tsx
│   └── globals.css
│
│
├── components/                  # reusable UI components
│
│   ├── ui/
│   │   ├── CrystalPanel.tsx
│   │   ├── CosmicButton.tsx
│   │   ├── WarpBadge.tsx
│   │   ├── EnergyBar.tsx
│   │   ├── PlanetOrb.tsx
│   │   ├── CosmicMetric.tsx
│   │   └── index.ts
│
│   ├── layout/
│   │   ├── ConstellationNav.tsx
│   │   ├── CosmicTopBar.tsx
│   │   ├── FloatingARIA.tsx
│   │   ├── CosmicCursor.tsx
│   │   └── CommandPalette.tsx
│
│   ├── background/
│   │   ├── CosmosEngine.tsx
│   │   ├── WormholeEntry.tsx
│   │   ├── ScanLine.tsx
│   │   └── NoiseOverlay.tsx
│
│   ├── student/
│   ├── trainer/
│   └── admin/
│
│
├── contexts/                    # React Context providers
│   ├── AuthContext.tsx
│   ├── ARIAContext.tsx
│   ├── NotificationContext.tsx
│   └── ThemeContext.tsx
│
│
├── hooks/                       # custom hooks
│   ├── useAuth.ts
│   ├── useUser.ts
│   ├── useCourses.ts
│   └── useSessions.ts
│
│
├── lib/                         # API utilities
│   ├── api.ts
│   ├── auth.ts
│   ├── jwt.ts
│   └── constants.ts
│
│
├── stores/                      # Zustand global state
│   ├── useAuthStore.ts
│   ├── useStudentStore.ts
│   ├── useTrainerStore.ts
│   ├── useAdminStore.ts
│   └── useUIStore.ts
│
│
├── styles/
│   ├── tokens.css
│   ├── animations.css
│   └── globals.css
│
│
├── types/
│   ├── user.ts
│   ├── course.ts
│   ├── session.ts
│   └── api.ts
│
│
├── public/
│   ├── icons/
│   ├── images/
│   └── logo.svg
│
│
├── middleware.ts                # role based route protection
│
├── next.config.ts
├── tsconfig.json
├── package.json
└── postcss.config.mjs