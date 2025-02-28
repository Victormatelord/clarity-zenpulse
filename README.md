# ZenPulse
A decentralized meditation app with custom music and breathing exercises tailored to user moods.

## Features
- Create personalized meditation sessions
- Store user mood data and preferences 
- Track meditation progress and achievements
- Earn ZEN tokens for completing sessions
- Access premium content with ZEN tokens

## Setup and Installation
1. Clone the repository
2. Install Clarinet
3. Run `clarinet check` to verify contracts
4. Run `clarinet test` to run test suite

## Usage Examples
```clarity
;; Create a new meditation session
(contract-call? .zenpulse create-session "calm" u300 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)

;; Complete a session and earn tokens
(contract-call? .zenpulse complete-session u1 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)

;; Get user statistics
(contract-call? .zenpulse get-user-stats 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM)
```

## Dependencies
- Clarity language
- Clarinet for testing and deployment
