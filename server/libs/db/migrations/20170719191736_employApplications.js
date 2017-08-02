// var knexConfig = require('../knexfile.js')
// var knexConnection = require('knex')(knexConfig['development']);

exports.up = function(knex, Promise) {
    console.log('Creating EmploymentApplications Tables')
    return Promise.all([
     knex.schema.createTableIfNotExists('EmploymentApplications', function (table) {
        table.increments('id');
        table.string('lastName');
        table.string('firstName');
        table.string('middleName');
        table.string('street');
        table.string('city');
        table.string('state');
        table.string('zipcode');
        table.string('mailing_street');
        table.string('mailing_city');
        table.string('mailing_state');
        table.string('mailing_zipcode');
        table.string('home_phone');
        table.string('cell_phone');
        table.bool('imigration_valid');
        table.bool('aboveMinimumAge');
        table.bool('minimumAge');
        table.string('positionApplied');
        table.dateTime('startDate');
        table.string('referredBy');
        table.bool('appliedBefore');
        table.bool('workedBefore');
        table.string('whenWorkedBefore');
        table.bool('whereWorkedBefore');
        table.string('reasonForLeaving');

          table.text('specializedSkills');
          table.text('relatedTraining');
      }),

       knex.schema.createTableIfNotExists('EmploymentDrivingHistory', function (table) {
          table.increments('id');
          table.integer('EmploymentApplicationsId');
          table.string('licenseNumber');
          table.string('state');
          table.string('type_class');
          table.dateTime('expireDate');
          table.text('accidentDetails');
          table.text('trafficViolations');
          table.text('suspensions_forfeitures');
      }),

      knex.schema.createTableIfNotExists('EmploymentReferences', function (table) {
          table.increments('id');
          table.integer('EmploymentApplicationsId');
          table.string('name');
          table.string('occupation');
          table.string('address');
          table.string('phoneNumber');
      }),
      knex.schema.createTableIfNotExists('EmploymentEducation', function (table) {
          table.increments('id');
          table.integer('EmploymentApplicationsId');
          table.string('level');
          table.string('schoolName');
          table.string('schoolAddress');
          table.string('courseOfStudy');
          table.string('yearsCompleted');
          table.string('degree_diploma');
      }),
      knex.schema.createTableIfNotExists('EmploymentExperience', function (table) {
          table.increments('id');
          table.integer('EmploymentApplicationsId');
          table.string('employer');
          table.dateTime('startDate');
          table.dateTime('endDate');
          table.string('workPerformed');
          table.string('address');
          table.string('supervisorName');
          table.string('supervisorPhoneNumber');
          table.string('jobTitle');
          table.string('startPay');
          table.string('reasonForLeaving');
      })
  ])
};

exports.down = function(knex, Promise) {
    console.log('Dropping EmploymentApplications Tables')
        return Promise.all([
        knex.schema.dropTableIfExists('EmploymentApplications'),
        knex.schema.dropTableIfExists('EmploymentDrivingHistory'),
        knex.schema.dropTableIfExists('EmploymentReferences'),
        knex.schema.dropTableIfExists('EmploymentEducation'),
        knex.schema.dropTableIfExists('EmploymentExperience'),
    ])
};
