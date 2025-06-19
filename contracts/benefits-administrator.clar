;; Benefits Administrator Verification Contract
;; Manages verification and authorization of benefits administrators

(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_ALREADY_VERIFIED (err u101))
(define-constant ERR_NOT_VERIFIED (err u102))

;; Data maps
(define-map verified-administrators principal bool)
(define-map administrator-details principal {
    name: (string-ascii 50),
    organization: (string-ascii 100),
    verified-at: uint,
    active: bool
})

;; Read-only functions
(define-read-only (is-verified-administrator (admin principal))
    (default-to false (map-get? verified-administrators admin))
)

(define-read-only (get-administrator-details (admin principal))
    (map-get? administrator-details admin)
)

;; Public functions
(define-public (verify-administrator (admin principal) (name (string-ascii 50)) (organization (string-ascii 100)))
    (begin
        (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
        (asserts! (not (is-verified-administrator admin)) ERR_ALREADY_VERIFIED)
        (map-set verified-administrators admin true)
        (map-set administrator-details admin {
            name: name,
            organization: organization,
            verified-at: block-height,
            active: true
        })
        (ok true)
    )
)

(define-public (revoke-administrator (admin principal))
    (begin
        (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
        (asserts! (is-verified-administrator admin) ERR_NOT_VERIFIED)
        (map-set verified-administrators admin false)
        (map-set administrator-details admin
            (merge (unwrap-panic (get-administrator-details admin)) { active: false })
        )
        (ok true)
    )
)
