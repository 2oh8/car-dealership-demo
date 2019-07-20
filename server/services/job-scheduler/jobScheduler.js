var schedule = require('node-schedule');
var moment = require('moment')

const taskCache = {}

const jobScheduler = {

    recurringTask(daysOfWeek, minute, hour, jobName, scheduledBy, jobKey, jobDetails, operation) {

        var rule = new schedule.RecurrenceRule();
        rule.dayOfWeek = daysOfWeek;
        rule.hour = hour;
        rule.minute = minute;

        if (!jobDetails) {
            jobDetails = ''
        }

        var taskCount = Object.keys(taskCache).length
        if (!jobName) {
            jobName = "Job" + taskCount + 1
        }

        function RecurringTask() {
            this.operation = schedule.scheduleJob(rule, operation);
            this.name = jobName
            this.details = jobDetails
            this.scheduledBy = scheduledBy
            this.scheduledOn = moment(new Date()).toDate()
        }

        taskCache[jobKey] = new RecurringTask()
    },
    oneTimeTask() {

    },
    runEveryXMinutes(minutes, jobName, scheduledBy, jobKey, jobDetails, operation) {

        if (!jobDetails) {
            jobDetails = ''
        }

        var taskCount = Object.keys(taskCache).length
        if (!jobName) {
            jobName = "Job" + taskCount + 1
        }

        function RecurringTask() {
            this.operation = this.operation = schedule.scheduleJob(`*/${minutes} * * * *`, operation)
            this.name = jobName
            this.details = jobDetails
            this.scheduledBy = scheduledBy
            this.scheduledOn = moment(new Date()).toDate()
        }

        taskCache[jobKey] = new RecurringTask()
    },
    runEveryXHours(hours, jobName, scheduledBy, jobKey, jobDetails, operation) {

        if (!jobDetails) {
            jobDetails = ''
        }

        var taskCount = Object.keys(taskCache).length
        if (!jobName) {
            jobName = "Job" + taskCount + 1
        }

        function RecurringTask() {
            this.operation = schedule.scheduleJob(`* */${hours} * * *`, operation)
            this.name = jobName
            this.details = jobDetails
            this.scheduledBy = scheduledBy
            this.scheduledOn = moment(new Date()).toDate()
        }

        taskCache[jobKey] = new RecurringTask()
    },
    getTasks() {
        var tasks = Object.keys(taskCache)
        console.log(" ")
        console.log("There are " + tasks.length + " job(s) currently running on the server.")
        console.log(" ")
        tasks.forEach(function (task) {
            console.error(taskCache[task].name)
            console.log("Scheduled By: " + taskCache[task].scheduledBy)
            console.log("Scheduled On: " + taskCache[task].scheduledOn)
            // console.log(" ")
            console.log("Description: " + taskCache[task].details)
            console.log(" ")
        })
    },
    cancelTask(taskKey) {
        var selectedJob = taskCache[taskKey]
        if (selectedJob) {
            console.error(selectedJob.name + " scheduled by " + selectedJob.scheduledBy + " on " + selectedJob.scheduledOn + " has been selected for cancellation.")
            console.error("Cancelling job...")
            taskCache[taskKey].operation.cancel()
            delete taskCache[taskKey]
            delete selectedJob
            if (!taskCache[taskKey]) {
                console.log("Job cancelled!")
            }
        } else {
            console.error("No job found with jobKey of " + taskKey + "!")
        }

    }

}

module.exports = jobScheduler


// RECURRING TASK PARAMS:
// email:
// {
// 
//  type: email,
//  group: admins, customers, or vendors,
//  template: templateName,
//  
// }

// CRON STRUCTURE
// *    *    *    *    *    *
// ┬    ┬    ┬    ┬    ┬    ┬
// │    │    │    │    │    │
// │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
// │    │    │    │    └───── month (1 - 12)
// │    │    │    └────────── day of month (1 - 31)
// │    │    └─────────────── hour (0 - 23)
// │    └──────────────────── minute (0 - 59)
// └───────────────────────── second (0 - 59, OPTIONAL)