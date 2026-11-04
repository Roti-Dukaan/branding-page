"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface BranchContextValue {
  branchId: string | null
  isLoading: boolean
}

const BranchContext = createContext<BranchContextValue>({
  branchId: null,
  isLoading: true,
})

export function BranchProvider({ children }: { children: ReactNode }) {
  const [branchId, setBranchId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function resolveBranch() {
      try {
        const { branchService } = await import("./branch.service")
        const branch = await branchService.getDefaultBranch()
        setBranchId(branch?.id ?? null)
      } catch {
        setBranchId(null)
      } finally {
        setIsLoading(false)
      }
    }
    resolveBranch()
  }, [])

  return (
    <BranchContext.Provider value={{ branchId, isLoading }}>
      {children}
    </BranchContext.Provider>
  )
}

export function useBranch() {
  const context = useContext(BranchContext)
  if (!context) {
    throw new Error("useBranch must be used within a BranchProvider")
  }
  return context
}
