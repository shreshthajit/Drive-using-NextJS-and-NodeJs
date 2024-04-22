const { Documents } = require("../Models/documents.schema");
const {
  HTTP_STATUS_CODE,
  MESSAGE,
  RESPONSE_TITLES,
} = require("../utilities/constants.utils");

exports.createDocument = async (req, res, next) => {
  try {
    let doc = {
      user: req.user._id,
    };
    if (req.body.name) {
      doc.name = req.body.name;
    }
    if (req.body.data) {
      doc.data = req.body.data;
    }
    if (req.body.added_by) {
      doc.added_by = req.body.added_by;
    }
    const document = await Documents.create(doc);
    return res.status(HTTP_STATUS_CODE.CREATED).json({
      status: HTTP_STATUS_CODE.CREATED,
      message: MESSAGE.DOC_CREATED_SUCCESSFULLY,
      success: true,
      data: document,
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

exports.getDocument = async (req, res, next) => {
  try {
    if (!req.params.id) {
      throw new Error("Document id is required");
    }
    const document = await Documents.findOne({
      _id: req.params.id,
      is_deleted: false,
    });
    if (!document) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        status: HTTP_STATUS_CODE.NOT_FOUND,
        message: MESSAGE.DOC_NOT_FOUND,
        success: true,
        data: null,
        error: MESSAGE.DOC_NOT_FOUND,
      });
    }
    return res.status(HTTP_STATUS_CODE.OK).json({
      status: HTTP_STATUS_CODE.OK,
      message: MESSAGE.DOC_GET_SUCCESSFULLY,
      success: true,
      data: document,
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

exports.getRecentDocuments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const documents = await Documents.find({
      user: req.user._id,
      is_deleted: false,
    })
      .select("-data")
      .sort({ updatedAt: "desc" })
      .skip(offset)
      .limit(limit);
    return res.status(HTTP_STATUS_CODE.OK).json({
      status: HTTP_STATUS_CODE.OK,
      message: MESSAGE.DOC_GET_SUCCESSFULLY,
      success: true,
      data: documents,
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

exports.updateDocument = async (req, res, next) => {
  try {
    if (!req.params.id) {
      throw new Error("Document id is required");
    }
    const document = await Documents.findByIdAndUpdate(
      req.params.id,
      req.body
    ).select("_id name user added_by is_deleted");
    return res.status(HTTP_STATUS_CODE.OK).json({
      status: HTTP_STATUS_CODE.OK,
      message: MESSAGE.DOC_UPDATED_SUCCESSFULLY,
      success: true,
      data: document,
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

exports.deleteDocument = async (req, res, next) => {
  try {
    if (!req.params.id) {
      throw new Error("Document id is required");
    }
    const document = await Documents.findByIdAndUpdate(req.params.id, {
      is_deleted: true,
    });
    return res.status(HTTP_STATUS_CODE.OK).json({
      status: HTTP_STATUS_CODE.OK,
      message: MESSAGE.DOC_DELETED_SUCCESSFULLY,
      success: true,
      data: document,
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
