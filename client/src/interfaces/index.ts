export interface User {
    id: string,
    firstName: string,
    lastName: string,
    middleInitial?: string,
    email: string,
    role: Role
}

export interface Role {
    type: string,
    lrn?: string
}

export interface Section {
    id: String,
    name: String,
    adviser: User
}