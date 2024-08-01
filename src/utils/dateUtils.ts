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
