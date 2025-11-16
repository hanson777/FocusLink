## Inspiration
As university students, we noticed how easy it is to lose consistency when studying alone. Pomodoro timers help, until motivation dies shortly after. Social apps do more harm than good. We wanted a tool that keeps us focused and accountable, without becoming another distraction. That’s how FocusLink was born: a social productivity app - paired with a distraction-blocking browser extension -  that brings friends together to build better study habits.

## What it does
FocusLink is a social focus + accountability platform that helps students stay consistent.

Users can:
- Start Pomodoro, 90-minute, or custom focus sessions
- Track daily goals** for minutes and sessions
- See progress visualized in real time
- Add friends and view their recent focus stats
- Stay motivated through shared accountability
- Use our custom Chrome extension to block distracting websites during focus sessions

It boosts consistency and turns studying from an isolating activity into a shared effort.

## How we built it
We built FocusLink using:
- React + Tailwind for a clean, modern front-end 
- FastAPI (Python) for a lightweight but powerful backend
- Supabase Postgres for persistent storage of users, study sessions, daily goals, and friends
- REST APIs for user status, timers, goals, and friend management
- A custom Chrome extension that listens for events during a focus session and blocks distracting websites 
- Real-time UI updates using React hooks and custom API wrappers

We learned many of these technologies on the fly during this hackathon at the cost of our precious sleep, but the final product made it worth it.

## Challenges we ran into
- Setting up, configuring, and connecting the database to the frontend. (much harder than expected!)
- 404s and API issues that wouldn't budge until we perfectly aligned endpoints and implemented middleware
- State management between timer logic, session tracking, and backend persistence
- Merging work across multiple team members without breaking existing features (at some point, we stopped caring about merge conflicts)
- Intricate edge cases that arise when switching timer modes mid-session
- Learning how to create and Integrate a Chrome extension with a FastAPI backend

## Accomplishments that we're proud of
- Built a full-stack productivity app in under 19 hours
- Implemented a dynamic focus timer hooked to real backend study-session logging
- Created daily goal tracking with editable progress and UI visualization (in real time)!
- Enabled a friend system that reads and updates real database entries
- Designed a clean UI with a sleek and modern look
- Developed a companion Chrome extension that blocks distracting websites during focus sessions
- Overcame major API integration problems to deliver a smooth final product
- Somehow debugging our code while being completely sleep-deprived

## What we learned
- How to connect a React frontend to a FastAPI backend
- How to handle basic user authentification
- How to structure and deploy a Supabase database under time pressure
- How to debug CORS, routing, and async timing issues across multiple layers
- How to build a Chrome extension complete with authentification and integrate it within our live web app
- How real teamwork, communication, and rapid iteration matter in a hackathon
- That building a polished full-stack product in 18 hours is extremely painful but insanely rewarding and fun

## What's next for FocusLink

We want to take FocusLink further by adding:
- Real-time friend presence (WebSockets)
- Leaderboard + streaks for gamification
- Friend request system + profile pages
- Extension improvements like blacklist customization and even smoother pairing
- Mobile app version
- Calendar & weekly analytics
- AI-powered study recommendations based on patterns in your sessions

Our goal is to turn FocusLink into the easiest way for students to stay locked in, together.
