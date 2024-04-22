const { Notes } = require('../Models/notes.schema');
const {
  HTTP_STATUS_CODE,
  MESSAGE,
  RESPONSE_TITLES,
} = require('../utilities/constants.utils');
const { NotesValidator } = require('../validators/schema.validator');

exports.add = async (req, res, next) => {
  try {
    const validatedData = await NotesValidator.validateAsync({ ...req.body });
    const notes = await Notes.create(validatedData);
    return res
      .status(HTTP_STATUS_CODE.CREATED)
      .json({
        status: HTTP_STATUS_CODE.CREATED,
        message: MESSAGE.USER_REGISTERED_SUCCESSFULLY,
        success: true,
        data: { notes },
      });
  } catch (error) {
    console.log('Error occurred ', error);
    res
      .status(HTTP_STATUS_CODE.BAD_REQUEST)
      .json({
        code: HTTP_STATUS_CODE.BAD_REQUEST,
        status: RESPONSE_TITLES.ERROR,
        message: MESSAGE.USER_NOT_FOUND,
        data: null,
        error,
      });
    next(error);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const results = await Notes.findOne({ _id: id });
    return res
      .status(HTTP_STATUS_CODE.OK)
      .json({
        status: HTTP_STATUS_CODE.OK,
        message: MESSAGE.RESPONSE_SUCCESS,
        success: true,
        data: results,
      });
  } catch (error) {
    res
      .status(HTTP_STATUS_CODE.BAD_REQUEST)
      .json({
        code: HTTP_STATUS_CODE.BAD_REQUEST,
        status: RESPONSE_TITLES.ERROR,
        message: MESSAGE.BAD_REQUEST,
        data: null,
        error,
      });
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const { id } = req.params;

    const results = await Notes.find({ user: id }).populate('user');
    let d = await await Notes.find({});
    console.log('d', d);
    return res.status(HTTP_STATUS_CODE.OK).json({
      status: HTTP_STATUS_CODE.OK,
      message: MESSAGE.RESPONSE_SUCCESS,
      success: true,
      data: results,
    });
  } catch (error) {
    res
      .status(HTTP_STATUS_CODE.BAD_REQUEST)
      .json({
        code: HTTP_STATUS_CODE.BAD_REQUEST,
        status: RESPONSE_TITLES.ERROR,
        message: MESSAGE.BAD_REQUEST,
        data: null,
        error,
      });
    next(error);
  }
};

exports.getAllAdmin = async (req, res, next) => {
  try {
    const countQuery = Notes.countDocuments({});
    const query = Notes.find({}).populate('user');
    const [results, totalItems] = await Promise.all([
      query.exec(),
      countQuery.exec(),
    ]);

    return res.status(HTTP_STATUS_CODE.OK).json({
      status: HTTP_STATUS_CODE.OK,
      message: MESSAGE.RESPONSE_SUCCESS,
      success: true,
      data: {
        results,
        totalItems,
      },
    });
  } catch (error) {
    res
      .status(HTTP_STATUS_CODE.BAD_REQUEST)
      .json({
        code: HTTP_STATUS_CODE.BAD_REQUEST,
        status: RESPONSE_TITLES.ERROR,
        message: MESSAGE.BAD_REQUEST,
        data: null,
        error,
      });
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const results = await Notes.deleteOne({ _id: id });
    return res
      .status(HTTP_STATUS_CODE.DELETE_SUCCESS)
      .json({
        status: HTTP_STATUS_CODE.DELETE_SUCCESS,
        message: MESSAGE.DELETE_SUCCESS,
        success: true,
        data: results,
      });
  } catch (error) {
    res
      .status(HTTP_STATUS_CODE.BAD_REQUEST)
      .json({
        code: HTTP_STATUS_CODE.BAD_REQUEST,
        status: RESPONSE_TITLES.ERROR,
        message: MESSAGE.BAD_REQUEST,
        data: null,
        error,
      });
    next(error);
  }
};
