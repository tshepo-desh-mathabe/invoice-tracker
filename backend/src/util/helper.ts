/**
 * Generates a random 15-digit transaction reference.
 * Each digit is randomly selected from 0 to 9.
 * @returns {string} A 15-digit numeric string
 */
export function generateTrxnReference(): string {
    let ref = '';
    for (let i = 0; i < 15; i++) {
        // Append a random digit (0-9) to the reference string
        ref += Math.floor(Math.random() * 10);
    }
    return ref;
}

/**
 * Calculates an expiry date based on the current date and a given number of days.
 * @param {string} expiryDays - Number of days until expiry, passed as a string
 * @returns {Date} A Date object representing the expiry date
 */
export function getExpiryDate(expiryDays: string): Date {
    const now = new Date(); // current date and time
    const settingExpiryDate = new Date(now); // clone current date
    // Add the specified number of days to the current date
    settingExpiryDate.setDate(now.getDate() + Number(expiryDays));

    return settingExpiryDate;
}
