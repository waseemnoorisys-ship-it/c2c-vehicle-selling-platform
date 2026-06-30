const mongoose = require("mongoose");
const Master   = require("../../models/master/master.model");
const ApiError = require("../../utils/ApiError");

const COUNTRY_SORT_FIELDS = ["name", "iso2", "phonecode", "currency"];
const STATE_CITY_SORT_FIELDS = ["name"];

function buildCountryMatch(countryId) {
  if (!countryId) return {};
  const idStr = String(countryId);
  if (/^[a-f\d]{24}$/i.test(idStr)) {
    return { _id: new mongoose.Types.ObjectId(idStr) };
  }
  return { id: Number(countryId) };
}

function paginateStages(page, limit, projection) {
  return [
    {
      $facet: {
        data: [
          { $skip: (page - 1) * limit },
          { $limit: Number(limit) },
          { $project: projection },
        ],
        totalCount: [{ $count: "count" }],
      },
    },
    {
      $project: {
        data: 1,
        total: {
          $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0],
        },
      },
    },
  ];
}

function formatResult(result, page, limit) {
  const total = result[0]?.total ?? 0;
  return {
    page:       Number(page),
    limit:      Number(limit),
    total,
    totalPages: Math.ceil(total / limit) || 0,
    data:       result[0]?.data ?? [],
  };
}

async function aggregateCountries({ q, page, limit, sort, fields }) {
  if (!COUNTRY_SORT_FIELDS.includes(sort)) {
    throw new ApiError(400, `Invalid sort field for country. Allowed: ${COUNTRY_SORT_FIELDS.join(", ")}`);
  }

  const match = {};
  if (q) {
    match.$or = [
      { name:  { $regex: q, $options: "i" } },
      { iso2:  { $regex: q, $options: "i" } },
      { iso3:  { $regex: q, $options: "i" } },
    ];
  }

  const defaultProjection = {
    _id: 1, id: 1, name: 1, iso2: 1, iso3: 1,
    phonecode: 1, currency: 1, currency_name: 1,
    currency_symbol: 1, emoji: 1, region: 1,
  };

  let projection = defaultProjection;
  if (fields) {
    projection = {};
    fields.split(",").forEach((f) => { projection[f.trim()] = 1; });
  }

  const pipeline = [
    { $match: match },
    { $sort: { [sort]: 1 } },
    ...paginateStages(page, limit, projection),
  ];

  return formatResult(await Master.aggregate(pipeline), page, limit);
}

async function aggregateStates({ countryId, q, page, limit, sort }) {
  if (!STATE_CITY_SORT_FIELDS.includes(sort)) {
    throw new ApiError(400, `Invalid sort field for state. Allowed: ${STATE_CITY_SORT_FIELDS.join(", ")}`);
  }

  const pipeline = [
    { $match: buildCountryMatch(countryId) },
    { $unwind: "$states" },
  ];

  if (q) {
    pipeline.push({ $match: { "states.name": { $regex: q, $options: "i" } } });
  }

  pipeline.push(
    { $sort: { [`states.${sort}`]: 1 } },
    ...paginateStages(page, limit, {
      id:          "$states.id",
      name:        "$states.name",
      iso2:        "$states.iso2",
      iso3166_2:   "$states.iso3166_2",
      type:        "$states.type",
      countryId:   "$_id",
      countryName: "$name",
      countryIso2: "$iso2",
    })
  );

  return formatResult(await Master.aggregate(pipeline), page, limit);
}

async function aggregateCities({ countryId, stateId, q, page, limit, sort }) {
  if (!STATE_CITY_SORT_FIELDS.includes(sort)) {
    throw new ApiError(400, `Invalid sort field for city. Allowed: ${STATE_CITY_SORT_FIELDS.join(", ")}`);
  }

  const pipeline = [
    { $match: buildCountryMatch(countryId) },
    { $unwind: "$states" },
    { $match: { "states.id": Number(stateId) } },
    { $unwind: "$cities" },
  ];

  if (q) {
    pipeline.push({ $match: { "cities.name": { $regex: q, $options: "i" } } });
  }

  pipeline.push(
    { $sort: { [`cities.${sort}`]: 1 } },
    ...paginateStages(page, limit, {
      id:          "$cities.id",
      name:        "$cities.name",
      latitude:    "$cities.latitude",
      longitude:   "$cities.longitude",
      timezone:    "$cities.timezone",
      stateId:     "$states.id",
      stateName:   "$states.name",
      countryId:   "$_id",
      countryName: "$name",
    })
  );

  return formatResult(await Master.aggregate(pipeline), page, limit);
}

const getMasterData = async (query) => {
  const {
    master,
    q,
    page = 1,
    limit = 10,
    fields,
    sort = "name",
    countryId,
    stateId,
  } = query;

  switch (master) {
    case "country":
      return aggregateCountries({ q, page, limit, sort, fields });
    case "state":
      return aggregateStates({ countryId, q, page, limit, sort });
    case "city":
      return aggregateCities({ countryId, stateId, q, page, limit, sort });
    default:
      throw new ApiError(400, "Invalid master type");
  }
};

module.exports = { getMasterData };
