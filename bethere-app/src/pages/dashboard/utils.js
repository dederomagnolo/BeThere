// field 3: internal humidity
// field 4: internal temperature
// field 5: external humidity
// field 6: external temperature
// field 7: pump indicator

export const setColorId = (fieldNumber) => {
    switch(fieldNumber) {
        case 3:
        return  "#266ed9";
        case 4:
            return "#f47560";
        case 5: 
            return "#99ccff";
        case 6:
            return "#e8c1a0";
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

export function isFromApp(changedFrom) {
    return changedFrom === "App";
}