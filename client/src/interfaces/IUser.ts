export interface UserPayload {
  id: string
  email: string
  token_version: number
  companyId?: string
  roles: string
}

export interface UserType {
  username?: string
  email: string
  mobileNo?: string
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  city?: string
  referalCode?: string
  roles: [RoleOptions]
  isActive: boolean
  company?: string
  id: string
  createdBy?: string
  createdDate?: Date
  timeZone?: string
}

export interface SignUpArgs {
  email: string
  firstName: string
  lastName: string
  password: string
  roles: [RoleOptions]
}

export enum RoleOptions {
  admin = 'ADMIN',
  operator = 'OPERATOR',
}
