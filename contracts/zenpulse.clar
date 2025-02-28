;; Define token for rewards
(define-fungible-token zen-token)

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-invalid-session (err u101))
(define-constant err-session-not-found (err u102))
(define-constant err-already-completed (err u103))

;; Data structures
(define-map sessions
  { session-id: uint }
  {
    user: principal,
    mood: (string-ascii 20),
    duration: uint,
    completed: bool,
    timestamp: uint
  }
)

(define-map user-stats
  { user: principal }
  {
    total-sessions: uint,
    total-duration: uint,
    tokens-earned: uint
  }
)

;; Session counter
(define-data-var session-counter uint u0)

;; Public functions
(define-public (create-session (mood (string-ascii 20)) (duration uint) (user principal))
  (let ((session-id (+ (var-get session-counter) u1)))
    (begin
      (map-set sessions
        { session-id: session-id }
        {
          user: user,
          mood: mood,
          duration: duration,
          completed: false,
          timestamp: block-height
        }
      )
      (var-set session-counter session-id)
      (ok session-id)
    )
  )
)

(define-public (complete-session (session-id uint) (user principal))
  (let ((session (unwrap! (map-get? sessions { session-id: session-id }) (err err-session-not-found))))
    (if (and
      (is-eq (get user session) user)
      (not (get completed session)))
      (begin
        (try! (update-user-stats user (get duration session)))
        (try! (ft-mint? zen-token (get duration session) user))
        (map-set sessions
          { session-id: session-id }
          (merge session { completed: true })
        )
        (ok true)
      )
      (err err-already-completed)
    )
  )
)

(define-private (update-user-stats (user principal) (duration uint))
  (let ((current-stats (default-to
    { total-sessions: u0, total-duration: u0, tokens-earned: u0 }
    (map-get? user-stats { user: user }))))
    (ok (map-set user-stats
      { user: user }
      {
        total-sessions: (+ (get total-sessions current-stats) u1),
        total-duration: (+ (get total-duration current-stats) duration),
        tokens-earned: (+ (get tokens-earned current-stats) duration)
      }
    ))
  )
)

;; Read only functions
(define-read-only (get-session (session-id uint))
  (ok (map-get? sessions { session-id: session-id }))
)

(define-read-only (get-user-stats (user principal))
  (ok (map-get? user-stats { user: user }))
)
