
export const setColorId = (fieldNumber) => {
    switch(fieldNumber) {
        case 3:
            return  "hsl(96, 70%, 50%)";
        case 4:
            return "hsl(216, 70%, 50%)";
        case 5: 
            return "hsl(18, 70%, 50%)";
        case 6:
            return "hsl(293, 70%, 50%)"
        default:
            return "hsl(96, 70%, 50%)"
    }
}

export const setMeasureId = (fieldNumber) => {
    switch(fieldNumber) {
        case 3:
            return "Internal Humidity"
        case 4:
            return "Internal Temperature"
        case 5: 
            return "External Humidity"
        case 6:
            return "External Temperature"
        default:
            return fieldNumber
    }
}

export function isOdd(num) { 
    return num % 2;
}