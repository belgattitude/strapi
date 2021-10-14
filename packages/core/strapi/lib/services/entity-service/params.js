'use strict';

const assert = require('assert').strict;
const { pick, isNil, toNumber, isInteger } = require('lodash/fp');

const {
  convertSortQueryParams,
  convertLimitQueryParams,
  convertStartQueryParams,
  convertPopulateQueryParams,
  convertFiltersQueryParams,
  convertFieldsQueryParams,
  convertPublicationStateParams,
} = require('@strapi/utils/lib/convert-query-params');

const pickSelectionParams = pick(['fields', 'populate']);

const transformParamsToQuery = (uid, params) => {
  // NOTE: can be a CT, a Compo or nothing in the case of polymorphism (DZ & morph relations)
  const type = strapi.getModel(uid);

  const query = {};

  const { _q, sort, filters, fields, populate, page, pageSize, start, limit } = params;

  if (!isNil(_q)) {
    query._q = _q;
  }

  if (!isNil(sort)) {
    query.orderBy = convertSortQueryParams(sort);
  }

  if (!isNil(filters)) {
    query.where = convertFiltersQueryParams(filters);
  }

  if (!isNil(fields)) {
    query.select = convertFieldsQueryParams(fields);
  }

  if (!isNil(populate)) {
    query.populate = convertPopulateQueryParams(populate);
  }

  const isPagePagination = !isNil(page) || !isNil(pageSize);
  const isOffsetPagination = !isNil(start) || !isNil(limit);

  if (isPagePagination && isOffsetPagination) {
    throw new Error(
      'Invalid pagination attributes. You cannot use page and offset pagination in the same query'
    );
  }

  if (!isNil(page)) {
    const pageVal = toNumber(page);
    const isValid = isInteger(pageVal) && pageVal > 0;

    assert(isValid, `Invalid 'page' parameter. Expected an integer > 0, received: ${page}`);

    query.page = pageVal;
  }

  if (!isNil(pageSize)) {
    const pageSizeVal = toNumber(pageSize);
    const isValid = isInteger(pageSizeVal) && pageSizeVal > 0;

    assert(isValid, `Invalid 'pageSize' parameter. Expected an integer > 0, received: ${page}`);

    query.pageSize = pageSizeVal;
  }

  if (!isNil(start)) {
    query.offset = convertStartQueryParams(start);
  }

  if (!isNil(limit)) {
    query.limit = convertLimitQueryParams(limit);
  }

  convertPublicationStateParams(type, params, query);

  return query;
};

module.exports = {
  transformParamsToQuery,
  pickSelectionParams,
};
