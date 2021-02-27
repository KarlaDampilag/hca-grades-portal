export const generateId = (prefix: string) => {
    return `${prefix}-${Date.now()}-${(Math.random()*100).toString()}`;
}

export const generateUsername = (id: string, firstName: string, lastName: string) => {
    return `${lastName}${firstName.charAt(1)}${id}`.toLowerCase();
}

export const generatePassword = () => {
    return Math.random().toString(36).slice(2);
}