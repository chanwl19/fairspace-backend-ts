export function checkSameDate(dateOne: Date, dateTwo: Date): boolean {
    try {
        const dateOneCopy = new Date(dateOne.getTime());
        const dateTwoCopy = new Date(dateTwo.getTime());
        dateOneCopy.setHours(0, 0, 0, 0);
        dateTwoCopy.setHours(0, 0, 0, 0);
        if (dateOneCopy.getTime() === dateTwoCopy.getTime()) {
            return true;
        }
        return false;
    } catch (err) {
        console.log(err);
        return false;
    }
}

export function checkOverlappTime(existingStartDt: Date, existingEndDt: Date, inputStartDt: Date, inputEndDt: Date): boolean {

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