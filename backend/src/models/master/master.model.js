const mongoose = require("mongoose");

const citySchema = new mongoose.Schema(
  {
    id:        { type: Number },
    name:      { type: String, trim: true },
    latitude:  { type: String },
    longitude: { type: String },
    timezone:  { type: String },
  },
  { _id: false }
);

const stateSchema = new mongoose.Schema(
  {
    id:         { type: Number },
    name:       { type: String, trim: true },
    iso2:       { type: String },
    iso3166_2:  { type: String },
    type:       { type: String },
    timezone:   { type: String },
    cities:     [citySchema],
  },
  //id false because we are using id as primary key
  { _id: false }
);

const masterSchema = new mongoose.Schema(
  {
    id:              { type: Number },
    name:            { type: String, trim: true },
    iso2:            { type: String },
    iso3:            { type: String },
    phonecode:       { type: String },
    currency:        { type: String },
    currency_name:   { type: String },
    currency_symbol: { type: String },
    emoji:           { type: String },
    region:          { type: String },
    states:          [stateSchema],
  },
  {
    versionKey: false,
    collection: "master",
  }
);

masterSchema.index({ name: 1 });
masterSchema.index({ iso2: 1 });
masterSchema.index({ id: 1 });

module.exports = mongoose.model("Master", masterSchema);
