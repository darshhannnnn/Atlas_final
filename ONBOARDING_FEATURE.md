# Onboarding Feature

## Overview
New users now go through a 3-step onboarding flow inspired by Claude's design to personalize their experience.

## User Flow

### Step 1: Name Input
- Clean, centered design with ATLAS logo
- Single input field: "Before we get started, what should I call you?"
- Blue-bordered input with arrow button to submit
- Enter key or button click to proceed

### Step 2: Interest Selection
- Question: "What are you into, {name}? Pick up to three topics to explore."
- 7 interest options with icons:
  - 💻 Coding & developing
  - 🎓 Learning & studying
  - ✍️ Writing & content creation
  - 📊 Business & strategy
  - 🎨 Design & creativity
  - ☕ Life stuff
  - 💡 ATLAS's choice
- Multi-select (max 3)
- Selected items highlighted in gold (#C9A574)
- Back button and "Let's go" button

### Step 3: Starter Prompts
- Title: "All set! Here are a few ideas just for you."
- Subtitle: "Where should we start?"
- 3 personalized prompts based on selected interests
- Each prompt is a clickable card with icon
- "I have my own topic →" link to skip
- Clicking a prompt starts a chat with that message

## Interest-Based Prompts

### Coding
- Create API documentation for my REST endpoints
- Build a React component with TypeScript
- Debug this Python error and explain the fix

### Learning
- Create a curriculum inspired by my favorite cultural movement
- Explain quantum computing in simple terms
- Create a study plan for learning machine learning

### Writing
- Write a blog post about sustainable technology
- Create engaging social media content for my brand
- Draft a professional email to a potential client

### Business
- Analyze market trends for my startup idea
- Create a business plan outline
- Develop a go-to-market strategy

### Design
- Generate color palette ideas for my brand
- Create a UI/UX design system structure
- Design a logo concept with meaning

### Life
- Plan a healthy meal prep for the week
- Suggest productivity tips for remote work
- Create a morning routine that boosts energy

### General (ATLAS's choice)
- Surprise me with an interesting fact
- Help me brainstorm creative project ideas
- Explain a complex topic in a fun way

## Backend Changes

### Database Schema
Added to `users` table:
- `name` (VARCHAR) - User's preferred name
- `interests` (JSON) - Array of selected interest IDs
- `onboarding_completed` (BOOLEAN) - Whether user finished onboarding

### API Endpoints
- `PATCH /api/v1/auth/profile` - Update user profile
  - Body: `{ name, interests, onboarding_completed }`
  - Returns: Updated user object

- `GET /api/v1/auth/me` - Get current user (now includes onboarding fields)

### Models Updated
- `app/models/user.py` - Added onboarding columns
- `app/schemas/user.py` - Added UserProfileUpdate schema

## Frontend Changes

### New Components
- `src/pages/Onboarding.jsx` - 3-step onboarding flow

### Updated Components
- `src/App.jsx` - Added onboarding route and redirect logic
- `src/pages/Chat.jsx` - Handles initial prompts from onboarding
- `src/services/authService.js` - Added updateProfile method

### Routing Logic
- After registration → `/onboarding`
- After onboarding completion → `/chat`
- If user tries to access `/chat` without completing onboarding → redirect to `/onboarding`
- If user tries to access `/onboarding` after completing it → redirect to `/chat`

## Design Details

### Colors
- Background: #2C2C2C
- Text: #FFF8F0
- Accent: #C9A574
- Input background: #3C3C3C
- Borders: #4C4C4C

### Typography
- Headings: 4xl, font-display (Crimson Pro), bold
- Body: lg/base, Inter
- Smooth animations with fadeIn effect

### Animations
- Fade in on step transitions (0.5s)
- Hover effects on buttons and cards
- Smooth color transitions

## Setup Instructions

1. Run the setup script:
```bash
cd atlas
./SETUP_ONBOARDING.sh
```

2. Or manually:
```bash
docker-compose down
docker-compose build backend frontend
docker-compose up -d postgres
sleep 5
docker-compose up -d backend
sleep 5
docker-compose exec backend python migrate_onboarding.py
docker-compose up -d
```

## Testing

1. Register a new user at http://localhost:3000/register
2. You'll be redirected to onboarding
3. Complete the 3 steps
4. Start chatting with personalized experience

## Existing Users

Existing users are automatically marked as `onboarding_completed = true` during migration, so they won't see the onboarding flow.

## Future Enhancements

- Allow users to update interests from settings
- Show interest-based suggestions in chat
- Personalize agent recommendations based on interests
- Add more interest categories
- Track which prompts are most popular
