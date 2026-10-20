const masterService = require("../../services/master/master.service");
const ApiResponse = require("../../utils/ApiResponse");
const { t } = require("../../utils/i18n");
const { getLang } = require("../../utils/getLang");
const { getCache, setCache } = require("../../config/redis");

// POST /api/v1/master/list
const getMaster = async (req, res, next) => {
  try {
    const lang = getLang(req);

    // 🟢 1. Check Redis
    const cacheKey = `c2c:master:list:${lang}:${JSON.stringify(req.body)}`;
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      res.setHeader("X-Cache", "HIT");
      return res.status(200).json(cachedData);
    }

    // 🟢 2. Fetch from database
    const data = await masterService.getMasterData(req.body);
    const responsePayload = new ApiResponse(200, data, t("success.master.fetched", lang));

    // 🟢 3. Master data rarely changes, cache for 24 hours (86400s)
    await setCache(cacheKey, responsePayload, 86400);

    res.setHeader("X-Cache", "MISS");
    return res.status(200).json(responsePayload);
  } catch (err) {
    next(err);
  }
};

module.exports = { getMaster };
