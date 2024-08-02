"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkOverlappTime = exports.checkSameDate = void 0;
function checkSameDate(dateOne, dateTwo) {
    try {
        const dateOneCopy = new Date(dateOne.getTime());
        const dateTwoCopy = new Date(dateTwo.getTime());
        dateOneCopy.setHours(0, 0, 0, 0);
        dateTwoCopy.setHours(0, 0, 0, 0);
        if (dateOneCopy.getTime() === dateTwoCopy.getTime()) {
            return true;
        }
        return false;
    }
    catch (err) {
        console.log(err);
        return false;
    }
}
exports.checkSameDate = checkSameDate;
function checkOverlappTime(existingStartDt, existingEndDt, inputStartDt, inputEndDt) {
    if (existingStartDt.getTime() <= inputStartDt.getTime() && existingEndDt.getTime() >= inputEndDt.getTime()) {
        //case 1 new reservation is in the middle of an existing reservation
        return true;
    }
    if (existingStartDt.getTime() >= inputStartDt.getTime() && existingEndDt.getTime() <= inputEndDt.getTime()) {
        //case 2 new reservation covers an existing reservation
        return true;
    }
    if (existingStartDt.getTime() > inputStartDt.getTime() && existingStartDt.getTime() < inputEndDt.getTime()) {
        //case 3 new reservation end date overlaps with an exsiting reservation
        return true;
    }
    if (existingEndDt.getTime() > inputStartDt.getTime() && existingEndDt.getTime() < inputEndDt.getTime()) {
        //case 4 new reservation start date overlaps with an exsiting reservation
        return true;
    }
    return false;
}
exports.checkOverlappTime = checkOverlappTime;
