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

async function aggregateCountries({ q, sort, fields }) {
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
    { $project: projection },
  ];

  const data = await Master.aggregate(pipeline);
  return { data };
}

async function aggregateStates({ countryId, q, sort }) {
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
    {
      $project: {
        id:          "$states.id",
        name:        "$states.name",
        iso2:        "$states.iso2",
        iso3166_2:   "$states.iso3166_2",
        type:        "$states.type",
        countryId:   "$_id",
        countryName: "$name",
        countryIso2: "$iso2",
      },
    }
  );

  const data = await Master.aggregate(pipeline);
  return { data };
}

async function aggregateCities({ countryId, stateId, q, sort }) {
  if (!STATE_CITY_SORT_FIELDS.includes(sort)) {
    throw new ApiError(400, `Invalid sort field for city. Allowed: ${STATE_CITY_SORT_FIELDS.join(", ")}`);
  }

  const pipeline = [
    { $match: buildCountryMatch(countryId) },
    { $unwind: "$states" },
    { $match: { "states.id": Number(stateId) } },
    { $unwind: "$states.cities" },
  ];

  if (q) {
    pipeline.push({ $match: { "states.cities.name": { $regex: q, $options: "i" } } });
  }

  pipeline.push(
    { $sort: { [`states.cities.${sort}`]: 1 } },
    {
      $project: {
        id:          "$states.cities.id",
        name:        "$states.cities.name",
        latitude:    "$states.cities.latitude",
        longitude:   "$states.cities.longitude",
        timezone:    "$states.cities.timezone",
        stateId:     "$states.id",
        stateName:   "$states.name",
        countryId:   "$_id",
        countryName: "$name",
      },
    }
  );

  const data = await Master.aggregate(pipeline);
  return { data };
}

const getMasterData = async (query) => {
  const {
    master,
    q,
    fields,
    sort = "name",
    countryId,
    stateId,
  } = query;

  switch (master) {
    case "country":
      return aggregateCountries({ q, sort, fields });
    case "state":
      return aggregateStates({ countryId, q, sort });
    case "city":
      return aggregateCities({ countryId, stateId, q, sort });
    default:
      throw new ApiError(400, "Invalid master type");
  }
};

module.exports = { getMasterData };
