import { MyClass } from '../interfaces/index';

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

interface FinalGrade {
    class: MyClass,
    1: number,
    2: number,
    3: number,
    4: number
}

// TODO unconfirmed formula
export const getFinalGrade = (grade: FinalGrade): number => {
    return (grade['1'] + grade['2'] + grade['3'] + grade['4']) / 4;
}

export const getFinalGradeView = (grade: FinalGrade): number | 'NA' => {
    if (grade['1'] > 0 && grade['2'] > 0 && grade['3'] > 0 && grade['4'] > 0) {
        return (grade['1'] + grade['2'] + grade['3'] + grade['4']) / 4;
    }
    return 'NA';
}