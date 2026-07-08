const masterService = require("../../services/master/master.service");
const ApiResponse   = require("../../utils/ApiResponse");
const { t } = require("../../utils/i18n");
const { getLang } = require("../../utils/getLang");

// POST /api/v1/master/list
const getMaster = async (req, res, next) => {
  try {
    const lang = getLang(req);
    const data = await masterService.getMasterData(req.body);

    res
      .status(200)
      .json(new ApiResponse(200, data, t("success.master.fetched", lang)));
  } catch (err) {
    next(err);
  }
};

module.exports = { getMaster };
