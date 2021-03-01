export const generateId = (prefix: string) => {
    return `${prefix}-${Date.now()}-${(Math.random()*100).toString()}`;
}

export const generateUsername = (id: string, firstName: string, lastName: string) => {
    return `${lastName}${firstName.charAt(1)}${id}`.toLowerCase();
}

export const generatePassword = () => {
    return Math.random().toString(36).slice(2);
}

export const getQuarterNumber = (quarter): string => {
    switch (quarter) {
        case '1':
            return '1st';
        case '2':
            return '2nd';
        case '3':
            return '3rd';
        case '4':
            return '4th';
        default:
            return '';
    }
}