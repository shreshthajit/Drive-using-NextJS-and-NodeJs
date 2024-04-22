const { Sheets } = require("../Models/sheets.schema");
const {
  HTTP_STATUS_CODE,
  MESSAGE,
  RESPONSE_TITLES,
} = require("../utilities/constants.utils");

exports.createSheet = async (req, res, next) => {
  try {
    let _sheet = {
      user: req.user._id,
    };
    if (req.body.name) {
      _sheet.name = req.body.name;
    }
    if (req.body.data) {
      _sheet.data = req.body.data;
    }
    if (req.body.added_by) {
      _sheet.added_by = req.body.added_by;
    }
    const sheet = await Sheets.create(_sheet);
    return res.status(HTTP_STATUS_CODE.CREATED).json({
      status: HTTP_STATUS_CODE.CREATED,
      message: MESSAGE.SHEET_CREATED_SUCCESSFULLY,
      success: true,
      data: sheet,
    });
  } catch (error) {
    res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      code: HTTP_STATUS_CODE.BAD_REQUEST,
      status: RESPONSE_TITLES.ERROR,
      message: MESSAGE.BAD_REQUEST,
      data: null,
      error,
    });
    next(error);
  }
};

exports.getSheet = async (req, res, next) => {
  try {
    if (!req.params.id) {
      throw new Error("Sheet id is required");
    }
    const sheet = await Sheets.findOne({
      _id: req.params.id,
      is_deleted: false,
    });
    if (!sheet) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        status: HTTP_STATUS_CODE.NOT_FOUND,
        message: MESSAGE.SHEET_NOT_FOUND,
        success: true,
        data: null,
        error: MESSAGE.SHEET_NOT_FOUND,
      });
    }
    return res.status(HTTP_STATUS_CODE.OK).json({
      status: HTTP_STATUS_CODE.OK,
      message: MESSAGE.SHEET_GET_SUCCESSFULLY,
      success: true,
      data: sheet,
    });
  } catch (error) {
    res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      code: HTTP_STATUS_CODE.BAD_REQUEST,
      status: RESPONSE_TITLES.ERROR,
      message: MESSAGE.BAD_REQUEST,
      data: null,
      error,
    });
    next(error);
  }
};

exports.getRecentSheets = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const sheets = await Sheets.find({
      user: req.user._id,
      is_deleted: false,
    })
      .select("-data")
      .sort({ updatedAt: "desc" })
      .skip(offset)
      .limit(limit);
    return res.status(HTTP_STATUS_CODE.OK).json({
      status: HTTP_STATUS_CODE.OK,
      message: MESSAGE.SHEET_GET_SUCCESSFULLY,
      success: true,
      data: sheets,
    });
  } catch (error) {
    res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      code: HTTP_STATUS_CODE.BAD_REQUEST,
      status: RESPONSE_TITLES.ERROR,
      message: MESSAGE.BAD_REQUEST,
      data: null,
      error,
    });
    next(error);
  }
};

exports.updateSheet = async (req, res, next) => {
  try {
    if (!req.params.id) {
      throw new Error("Sheet id is required");
    }
    const sheet = await Sheets.findByIdAndUpdate(
      req.params.id,
      req.body
    ).select("_id name user added_by is_deleted");
    return res.status(HTTP_STATUS_CODE.OK).json({
      status: HTTP_STATUS_CODE.OK,
      message: MESSAGE.SHEET_UPDATED_SUCCESSFULLY,
      success: true,
      data: sheet,
    });
  } catch (error) {
    res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      code: HTTP_STATUS_CODE.BAD_REQUEST,
      status: RESPONSE_TITLES.ERROR,
      message: MESSAGE.BAD_REQUEST,
      data: null,
      error,
    });
    next(error);
  }
};

exports.deleteSheet = async (req, res, next) => {
  try {
    if (!req.params.id) {
      throw new Error("Sheet id is required");
    }
    const sheet = await Sheets.findByIdAndUpdate(req.params.id, {
      is_deleted: true,
    });
    return res.status(HTTP_STATUS_CODE.OK).json({
      status: HTTP_STATUS_CODE.OK,
      message: MESSAGE.SHEET_DELETED_SUCCESSFULLY,
      success: true,
      data: sheet,
    });
  } catch (error) {
    res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      code: HTTP_STATUS_CODE.BAD_REQUEST,
      status: RESPONSE_TITLES.ERROR,
      message: MESSAGE.BAD_REQUEST,
      data: null,
      error,
    });
    next(error);
  }
};
