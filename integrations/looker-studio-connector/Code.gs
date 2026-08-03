#!/usr/bin/env node
/**
 * Looker Studio Community Connector for Voice AI Platform Analytics Export API.
 *
 * Deploy as a Google Apps Script community connector.
 * @see https://developers.google.com/looker-studio/connector
 */

var cc = DataStudioApp.createCommunityConnector();

function getAuthType() {
  return cc.newAuthTypeResponse()
    .setAuthType(cc.AuthType.KEY)
    .setHelpUrl('https://developers.google.com/looker-studio/connector/auth')
    .build();
}

function isAuthValid() {
  var userProperties = PropertiesService.getUserProperties();
  var key = userProperties.getProperty('ds_token');
  return key !== null && key.length > 0;
}

function setCredentials(request) {
  var token = request.key;
  PropertiesService.getUserProperties().setProperty('ds_token', token);
  return { errorCode: 'NONE' };
}

function resetAuth() {
  PropertiesService.getUserProperties().deleteProperty('ds_token');
}

function getConfig() {
  var config = cc.getConfig();
  config
    .newTextInput()
    .setId('export_url')
    .setName('Analytics Export URL')
    .setHelpText('Example: https://your-app.test/api/v1/analytics/export')
    .setAllowOverride(true);
  config
    .newTextInput()
    .setId('tenant_id')
    .setName('Tenant ID')
    .setAllowOverride(true);
  config.setDateRangeRequired(false);
  return config.build();
}

function getSchema(request) {
  var fields = getFields().build();
  return { schema: fields };
}

function getFields() {
  var fields = cc.getFields();
  var types = cc.FieldType;
  fields.newDimension().setId('call_id').setName('Call ID').setType(types.TEXT);
  fields.newDimension().setId('tenant_id').setName('Tenant ID').setType(types.TEXT);
  fields.newDimension().setId('flow_id').setName('Flow ID').setType(types.TEXT);
  fields.newDimension().setId('from').setName('From').setType(types.TEXT);
  fields.newDimension().setId('to').setName('To').setType(types.TEXT);
  fields.newDimension().setId('status').setName('Status').setType(types.TEXT);
  fields.newDimension().setId('language').setName('Language').setType(types.TEXT);
  fields.newMetric().setId('duration_seconds').setName('Duration Seconds').setType(types.NUMBER);
  fields.newDimension().setId('started_at').setName('Started At').setType(types.YEAR_MONTH_DAY_SECOND);
  fields.newDimension().setId('ended_at').setName('Ended At').setType(types.YEAR_MONTH_DAY_SECOND);
  fields.newDimension().setId('outcome').setName('Outcome').setType(types.TEXT);
  return fields;
}

function getData(request) {
  var token = PropertiesService.getUserProperties().getProperty('ds_token');
  var url = request.configParams.export_url +
    '?tenant_id=' + encodeURIComponent(request.configParams.tenant_id) +
    '&limit=500';

  var response = UrlFetchApp.fetch(url, {
    method: 'get',
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/json',
    },
    muteHttpExceptions: true,
  });

  if (response.getResponseCode() !== 200) {
    cc.newUserError()
      .setText('Export API returned HTTP ' + response.getResponseCode())
      .throwException();
  }

  var payload = JSON.parse(response.getContentText());
  var requested = request.fields.map(function (f) { return f.name; });
  var rows = (payload.rows || []).map(function (row) {
    return {
      values: requested.map(function (fieldId) {
        var value = row[fieldId];
        return value === null || value === undefined ? '' : value;
      }),
    };
  });

  return {
    schema: getFields().forIds(requested).build(),
    rows: rows,
  };
}

function isAdminUser() {
  return false;
}
