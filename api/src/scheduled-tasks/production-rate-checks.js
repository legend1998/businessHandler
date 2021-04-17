const schedule = require('node-schedule');
const moment = require('moment');

const db = require('../helpers/database.js');
const { sendMail } = require('../helpers/email.js');

// This is a daily recurring job that checks the production rates and verifies that they were met
const job = schedule.scheduleJob('0 0 * * *', async () => {

    // Get all production rates
    const productionRates = await db('erp.production_rate as pr')
        .select('pr.*', 'l.business_id', 'u.email')
        .innerJoin('erp.location as l','l.id','pr.location_id')
        .innerJoin('erp.business as b','b.id','l.business_id')
        .innerJoin('erp.user as u', 'u.id', 'b.owner_id');

    // Reduce production rates by business
    // array format: [{ email: 'test@test.com', rates: [/* array of production rates */] }, {....}, ...]
    const prodRatesByBusiness = productionRates.reduce((accumulator, pr) => {
        const existingBusinessRates = accumulator.find(b => b.business_id === pr.business_id);
        if (existingBusinessRates)
            existingBusinessRates.rates.push(pr);
        else
            accumulator.push({ business_id: pr.business_id, email: pr.email, rates: [pr] });
        return accumulator;
    }, []);

    const rates = {
        DAILY: 1,
        WEEKLY: 7,
        'BI-WEEKLY': 14,
        MONTHLY: 30,
        ANNUALLY: 365
    }

    const prodRatesToReset = [];
    for (const prodRatesSameBusiness of prodRatesByBusiness) {
        const email = prodRatesSameBusiness.email;
        let amountMissed = 0;
        for (const productionRate of prodRatesSameBusiness.rates) {
            const start = moment(productionRate.updated_at);
            const end = moment();
            const diffDays = moment.duration(end.diff(start)).asDays();
            // Production rate needs to be evaluated
            if (diffDays >= rates[productionRate.frequency.toUpperCase()]) {
                prodRatesToReset.push(productionRate);
                // Production has fallen behind
                if (productionRate.produced < productionRate.target_amount)
                    amountMissed++;
            }
        }

        // Send email to business owner if any production rates were not met
        if (amountMissed > 0) {
            await sendMail(email, 'Missing Production Rates', 'missing-rates', { AMOUNT_MISSED: amountMissed });
        }
    }

    // Reset the production rates that were evaluated
    await db('erp.production_rate')
        .whereIn('id', prodRatesToReset.map(pr => pr.id))
        .update({
            amount: 0
        });

});
