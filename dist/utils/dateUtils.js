"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSameDate = void 0;
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
