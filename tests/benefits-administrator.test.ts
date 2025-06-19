import { describe, it, expect, beforeEach } from "vitest"

describe("Benefits Administrator Contract", () => {
  let contractState
  
  beforeEach(() => {
    contractState = {
      verifiedAdministrators: new Map(),
      administratorDetails: new Map(),
      contractOwner: "SP1OWNER123",
    }
  })
  
  describe("verify-administrator", () => {
    it("should verify a new administrator successfully", () => {
      const admin = "SP1ADMIN123"
      const name = "John Doe"
      const organization = "HR Department"
      const txSender = "SP1OWNER123"
      
      // Simulate contract call
      const result = verifyAdministrator(contractState, admin, name, organization, txSender)
      
      expect(result.success).toBe(true)
      expect(contractState.verifiedAdministrators.get(admin)).toBe(true)
      expect(contractState.administratorDetails.get(admin)).toEqual({
        name,
        organization,
        verifiedAt: expect.any(Number),
        active: true,
      })
    })
    
    it("should reject verification from non-owner", () => {
      const admin = "SP1ADMIN123"
      const name = "John Doe"
      const organization = "HR Department"
      const txSender = "SP1NOTOWNER123"
      
      const result = verifyAdministrator(contractState, admin, name, organization, txSender)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe("ERR_UNAUTHORIZED")
    })
    
    it("should reject already verified administrator", () => {
      const admin = "SP1ADMIN123"
      const name = "John Doe"
      const organization = "HR Department"
      const txSender = "SP1OWNER123"
      
      // First verification
      verifyAdministrator(contractState, admin, name, organization, txSender)
      
      // Second verification attempt
      const result = verifyAdministrator(contractState, admin, name, organization, txSender)
      
      expect(result.success).toBe(false)
      expect(result.error).toBe("ERR_ALREADY_VERIFIED")
    })
  })
  
  describe("is-verified-administrator", () => {
    it("should return true for verified administrator", () => {
      const admin = "SP1ADMIN123"
      contractState.verifiedAdministrators.set(admin, true)
      
      const result = isVerifiedAdministrator(contractState, admin)
      
      expect(result).toBe(true)
    })
    
    it("should return false for unverified administrator", () => {
      const admin = "SP1ADMIN123"
      
      const result = isVerifiedAdministrator(contractState, admin)
      
      expect(result).toBe(false)
    })
  })
  
  describe("revoke-administrator", () => {
    it("should revoke verified administrator", () => {
      const admin = "SP1ADMIN123"
      const txSender = "SP1OWNER123"
      
      // Setup verified administrator
      contractState.verifiedAdministrators.set(admin, true)
      contractState.administratorDetails.set(admin, {
        name: "John Doe",
        organization: "HR Department",
        verifiedAt: 1000,
        active: true,
      })
      
      const result = revokeAdministrator(contractState, admin, txSender)
      
      expect(result.success).toBe(true)
      expect(contractState.verifiedAdministrators.get(admin)).toBe(false)
      expect(contractState.administratorDetails.get(admin).active).toBe(false)
    })
  })
})

// Mock contract functions
function verifyAdministrator(state, admin, name, organization, txSender) {
  if (txSender !== state.contractOwner) {
    return { success: false, error: "ERR_UNAUTHORIZED" }
  }
  
  if (state.verifiedAdministrators.get(admin)) {
    return { success: false, error: "ERR_ALREADY_VERIFIED" }
  }
  
  state.verifiedAdministrators.set(admin, true)
  state.administratorDetails.set(admin, {
    name,
    organization,
    verifiedAt: Date.now(),
    active: true,
  })
  
  return { success: true }
}

function isVerifiedAdministrator(state, admin) {
  return state.verifiedAdministrators.get(admin) || false
}

function revokeAdministrator(state, admin, txSender) {
  if (txSender !== state.contractOwner) {
    return { success: false, error: "ERR_UNAUTHORIZED" }
  }
  
  if (!state.verifiedAdministrators.get(admin)) {
    return { success: false, error: "ERR_NOT_VERIFIED" }
  }
  
  state.verifiedAdministrators.set(admin, false)
  const details = state.administratorDetails.get(admin)
  state.administratorDetails.set(admin, { ...details, active: false })
  
  return { success: true }
}
