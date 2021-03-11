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
    lrn?: string,
    sectionId?: string
}

export interface Section {
    id: string,
    name: string,
    adviser: User
}

export interface MyClass {
    id: string,
    name: string,
    teacherId: User,
    sectionId: Section
}

export interface Grade {
    id: string,
    studentId: string,
    scores: any,
    classId: string,
    quarter: number
}