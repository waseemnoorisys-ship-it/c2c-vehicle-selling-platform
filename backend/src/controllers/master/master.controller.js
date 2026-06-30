const masterService = require("../../services/master/master.service");
const ApiResponse   = require("../../utils/ApiResponse");

// POST /api/v1/master/list
const getMaster = async (req, res, next) => {
  try {
    const data = await masterService.getMasterData(req.body);

    res
      .status(200)
      .json(new ApiResponse(200, data, "Master data fetched successfully"));
  } catch (err) {
    next(err);
  }
};

module.exports = { getMaster };
