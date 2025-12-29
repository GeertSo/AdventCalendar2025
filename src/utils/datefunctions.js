let testMode = false;
let testDay = 24;
let testMonth = 12;
let testYear = 2025;

export function setTestMode(b) {
    testMode = b;
}
export function setTestDayMonthYear(day, month, year) {
    testDay = day;
    testMonth = month;
    testYear = year;
}

export function getTestMode() {
    return testMode;
}
export function getToday() {
    return !testMode ? new Date().getDate() : testDay;
}
export function getMonth() {
    return !testMode ? new Date().getMonth()+1 : testMonth;
}
export function getYear() {
    return !testMode ? new Date().getFullYear() : testYear;
}