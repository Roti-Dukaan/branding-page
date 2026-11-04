import { apiClient } from "../api/client"

interface Branch {
  id: string
  name: string
  code: string
  cityId: string
  areaId: string
  latitude: number
  longitude: number
  status: "OPEN" | "BUSY" | "CLOSED" | "MAINTENANCE"
}

interface ApiResponse<T> {
  success: boolean
  data: T
}

class BranchService {
  private defaultBranch: Branch | null = null
  private fetchPromise: Promise<Branch | null> | null = null

  async getDefaultBranch(): Promise<Branch | null> {
    if (this.defaultBranch) return this.defaultBranch
    if (this.fetchPromise) return this.fetchPromise

    this.fetchPromise = this.fetchDefault()
    return this.fetchPromise
  }

  private async fetchDefault(): Promise<Branch | null> {
    try {
      const { data } = await apiClient.get<ApiResponse<Branch[]>>("/admin/branches", {
        params: { isActive: true, status: "OPEN", limit: 1 },
      })
      const branches = data?.data
      if (Array.isArray(branches) && branches.length > 0) {
        this.defaultBranch = branches[0]
        return branches[0]
      }
      return null
    } catch {
      return null
    }
  }

  resetCache() {
    this.defaultBranch = null
    this.fetchPromise = null
  }
}

export const branchService = new BranchService()
