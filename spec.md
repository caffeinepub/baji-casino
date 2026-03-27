# Baji Win - Admin Help Desk Messages

## Current State
The app has a Help Desk chat in AccountPage (profile) with auto-replies only (no real backend). AdminPage only manages recharge requests. The backend has no help desk message functions.

## Requested Changes (Diff)

### Add
- Backend: `sendHelpMessage(text: Text)` - user sends a message, stored with userId + timestamp
- Backend: `getUserHelpMessages()` - user fetches their own chat history (user + support messages)
- Backend: `getAllHelpConversations()` - admin fetches all conversations (grouped by user)
- Backend: `replyHelpMessage(userId: Principal, text: Text)` - admin replies to a user, stored as support message in that user's conversation
- AdminPage: new "Help Desk" tab/section showing all user conversations, with reply input per user
- AccountPage: real messages from backend (no auto-replies), polling every 3 seconds for new support replies

### Modify
- AdminPage: add a tab bar (Recharge Requests | Help Desk)
- AccountPage Help Desk: replace auto-reply logic with real backend calls

### Remove
- Auto-reply simulation in AccountPage Help Desk

## Implementation Plan
1. Generate new Motoko backend with HelpMessage type, per-user message lists, and admin reply
2. Update frontend hooks/queries for new help desk APIs
3. Update AdminPage with Help Desk tab
4. Update AccountPage Help Desk to use real backend
