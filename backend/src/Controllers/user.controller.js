const jwt = require('jsonwebtoken');
const { User } = require('../Models/users.schema');
const CryptoJS = require('crypto-js');
const {
  HTTP_STATUS_CODE,
  MESSAGE,
  RESPONSE_TITLES,
} = require('../utilities/constants.utils');
const { UserValidator, SignUpValidator } = require('../validators/schema.validator');
const generateCode = require('../utilities/generet-code.utils');
const sendEmail = require('../utilities/mailer.utils');
const { VerificationCode } = require('../Models/verify-codes.schema');
require('dotenv').config();

const createToken = (email) => {
  return jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.verifyAccountCode = async (req, res, next) => {
  try {
    let db_user = await User.findOne({ email: req.body.email });
    if (db_user)
      return res.status(HTTP_STATUS_CODE.CONFLICT).json({
        status: HTTP_STATUS_CODE.NOT_FOUND,
        message: MESSAGE.DUPLICATE_RECORD,
        success: false,
        data: { data: MESSAGE.DUPLICATE_RECORD },
      });

    const code = generateCode(8);
    await sendEmail(req.body.email, code);
    await VerificationCode.create({
      email: req.body.email,
      code,
      is_active: true,
    });
    return res.status(HTTP_STATUS_CODE.CREATED).json({
      status: HTTP_STATUS_CODE.CREATED,
      status: RESPONSE_TITLES.CODE_GENERATED,
      message: MESSAGE.CODE_GENERATED,
      success: true,
      data: true,
    });
  } catch (error) {
    res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      code: HTTP_STATUS_CODE.BAD_REQUEST,
      status: RESPONSE_TITLES.ERROR,
      message: MESSAGE.USER_NOT_FOUND,
      data: null,
      error,
    });
    next(error);
  }
};

exports.signup = async (req, res, next) => {
  try {
    const { code } = req.params;
    const validatedData = await SignUpValidator.validateAsync({ ...req.body });
    let db_code = await VerificationCode.findOne({
      code,
      email: validatedData.email,
    });
    if (!db_code)
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        status: HTTP_STATUS_CODE.NOT_FOUND,
        message: MESSAGE.CODE_NOT,
        success: false,
        data: { data: MESSAGE.CODE_NOT },
      });

    let db_user = await User.findOne({ email: validatedData.email });
    if (db_user)
      return res.status(HTTP_STATUS_CODE.CONFLICT).json({
        status: HTTP_STATUS_CODE.NOT_FOUND,
        message: MESSAGE.DUPLICATE_RECORD,
        success: false,
        data: { data: MESSAGE.DUPLICATE_RECORD },
      });

    const encPass = CryptoJS.AES.encrypt(
      validatedData.password,
      process.env.ENCRYPTION_KEY
    ).toString();
    validatedData.password = encPass;
    await VerificationCode.findOneAndDelete({
      code,
      email: validatedData.email,
    });
    const user = await User.create(validatedData);
    const token = createToken(user.email, process.env.JWT_SECRET);
    return res.status(HTTP_STATUS_CODE.CREATED).json({
      status: HTTP_STATUS_CODE.CREATED,
      message: MESSAGE.USER_REGISTERED_SUCCESSFULLY,
      success: true,
      data: { token, user },
    });
  } catch (error) {
    res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      code: HTTP_STATUS_CODE.BAD_REQUEST,
      status: RESPONSE_TITLES.ERROR,
      message: MESSAGE.USER_NOT_FOUND,
      data: null,
      error,
    });
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!password || !email) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        code: HTTP_STATUS_CODE.BAD_REQUEST,
        status: RESPONSE_TITLES.ERROR,
        message: MESSAGE.USER_NOT_FOUND,
        data: null,
      });
    }
    const results = await User.findOne({ email });
    if (!results?.password) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        code: HTTP_STATUS_CODE.BAD_REQUEST,
        status: RESPONSE_TITLES.ERROR,
        message: MESSAGE.INVALID_CREDENTIALS,
        data: null,
      });
    }
    var bytes = CryptoJS.AES.decrypt(
      results?.password,
      process.env.ENCRYPTION_KEY
    );
    var dbPassword = bytes.toString(CryptoJS.enc.Utf8);
    if (results && dbPassword !== password)
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        code: HTTP_STATUS_CODE.BAD_REQUEST,
        status: RESPONSE_TITLES.ERROR,
        message: MESSAGE.INVALID_CREDENTIALS,
        data: null,
      });

    // Generate JWT token
    const token = createToken(results.email);
    return res.status(HTTP_STATUS_CODE.OK).json({
      code: HTTP_STATUS_CODE.OK,
      status: RESPONSE_TITLES.SUCCESS,
      message: MESSAGE.USER_LOGGEDIN_SUCCESSFULLY,
      error: null,
      data: { user: results, token },
    });
  } catch (error) {
    res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      code: HTTP_STATUS_CODE.BAD_REQUEST,
      status: RESPONSE_TITLES.ERROR,
      message: error.message || MESSAGE.USER_NOT_FOUND,
      data: null,
      error,
    });
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const results = await User.changePassword(req);
    if (results?.code)
      return res
        .status(results?.custom ? results.code : HTTP_STATUS_CODE.BAD_REQUEST)
        .json({
          code: results?.custom ? results.code : HTTP_STATUS_CODE.BAD_REQUEST,
          status: RESPONSE_TITLES.DB_ERROR,
          message: results?.custom
            ? results.error
            : HTTP_STATUS_CODE.BAD_REQUEST,
          data: null,
          error: results,
        });
    return res.status(HTTP_STATUS_CODE.OK).json({
      code: HTTP_STATUS_CODE.OK,
      status: RESPONSE_TITLES.SUCCESS,
      message: MESSAGE.DATA_UPDATED,
      error: null,
      data: null,
    });
  } catch (error) {
    res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      code: HTTP_STATUS_CODE.BAD_REQUEST,
      status: RESPONSE_TITLES.ERROR,
      message: MESSAGE.USER_NOT_FOUND,
      data: null,
      error,
    });
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const results = await User.updateUserLastSeen(req);
    if (results?.code)
      return res
        .status(results?.custom ? results.code : HTTP_STATUS_CODE.BAD_REQUEST)
        .json({
          code: results?.custom ? results.code : HTTP_STATUS_CODE.BAD_REQUEST,
          status: RESPONSE_TITLES.DB_ERROR,
          message: results?.custom
            ? results.error
            : HTTP_STATUS_CODE.BAD_REQUEST,
          data: null,
          error: results,
        });
    res.clearCookie('token');
    return res.status(HTTP_STATUS_CODE.OK).json({
      code: HTTP_STATUS_CODE.OK,
      status: RESPONSE_TITLES.SUCCESS,
      message: MESSAGE.USER_LOG_OUT,
      error: null,
      data: null,
    });
  } catch (error) {
    res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      code: HTTP_STATUS_CODE.BAD_REQUEST,
      status: RESPONSE_TITLES.ERROR,
      message: MESSAGE.USER_NOT_FOUND,
      data: null,
      error,
    });
    next(error);
  }
};

exports.add = async (req, res, next) => {
  try {
    const validatedData = await UserValidator.validateAsync({ ...req.body });
    let db_user = await User.findOne({ email: validatedData.email });
    if (db_user)
      return res.status(HTTP_STATUS_CODE.CONFLICT).json({
        status: HTTP_STATUS_CODE.NOT_FOUND,
        message: MESSAGE.DUPLICATE_RECORD,
        success: false,
        data: { data: MESSAGE.DUPLICATE_RECORD },
      });

    const encPass = CryptoJS.AES.encrypt(
      validatedData.password,
      process.env.ENCRYPTION_KEY
    ).toString();
    validatedData.password = encPass;
    const user = await User.create(validatedData);
    return res.status(HTTP_STATUS_CODE.CREATED).json({
      status: HTTP_STATUS_CODE.CREATED,
      message: MESSAGE.USER_REGISTERED_SUCCESSFULLY,
      success: true,
      data: { user },
    });
  } catch (error) {
    console.log('Error occurred ', error);
    res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
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
    const results = await User.findOne({ _id: id });
    return res.status(HTTP_STATUS_CODE.OK).json({
      status: HTTP_STATUS_CODE.OK,
      message: MESSAGE.RESPONSE_SUCCESS,
      success: true,
      data: results,
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

exports.getAllOrganizations = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', organization } = req.query;
    const offset = (page - 1) * limit;
    const query = {
      user_type: { $ne: 'super_admin' },
      $or: [
        { fullname: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { island: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } },
      ],
      organization,
    };
    const totalItems = await User.countDocuments(query);
    const u_query = User.find(query);
    let results = await u_query.skip(offset).limit(limit);
    const totalPages = Math.ceil(totalItems / limit) || 1;
    return res.status(HTTP_STATUS_CODE.OK).json({
      status: HTTP_STATUS_CODE.OK,
      message: MESSAGE.RESPONSE_SUCCESS,
      success: true,
      data: {
        results,
        totalItems,
        totalPages,
        currentPage: page,
      },
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
exports.getAllOrganizationsUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', organization = '' } = req.query;
    const offset = (page - 1) * limit;
    const query = {
      $or: [
        { fullname: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { island: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } },
      ],
      $and: [
        {
          $nor: [{ user_type: 'super_admin' }, { user_type: 'org_admin' }],
        },
        { organization: { $regex: organization, $options: 'i' } },
      ],
    };
    const totalItems = await User.countDocuments(query);
    const u_query = User.find(query);
    let results = await u_query.skip(offset).limit(limit);
    const totalPages = Math.ceil(totalItems / limit) || 1;
    return res.status(HTTP_STATUS_CODE.OK).json({
      status: HTTP_STATUS_CODE.OK,
      message: MESSAGE.RESPONSE_SUCCESS,
      success: true,
      data: {
        results,
        totalItems,
        totalPages,
        currentPage: page,
      },
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

exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', organization = '' } = req.query;
    const offset = (page - 1) * limit;
    const query = {
      $or: [
        { fullname: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { island: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } },
      ],
      user_type: { $ne: 'super_admin' },
      organization: { $regex: organization, $options: 'i' },
    };

    const totalItems = await User.countDocuments(query);
    const u_query = User.find(query);
    let results = await u_query.skip(offset).limit(limit);

    const totalPages = Math.ceil(totalItems / limit) || 1;
    return res.status(HTTP_STATUS_CODE.OK).json({
      status: HTTP_STATUS_CODE.OK,
      message: MESSAGE.RESPONSE_SUCCESS,
      success: true,
      data: {
        results,
        totalItems,
        totalPages,
        currentPage: page,
      },
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

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const results = await User.deleteOne({ _id: id });
    return res.status(HTTP_STATUS_CODE.DELETE_SUCCESS).json({
      status: HTTP_STATUS_CODE.DELETE_SUCCESS,
      message: MESSAGE.DELETE_SUCCESS,
      success: true,
      data: results,
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

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    if (updateFields.password) {
      const encPass = CryptoJS.AES.encrypt(
        updateFields.password,
        process.env.ENCRYPTION_KEY
      ).toString();
      updateFields.password = encPass;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        status: HTTP_STATUS_CODE.NOT_FOUND,
        message: MESSAGE.USER_NOT_FOUND,
        success: false,
        data: null,
      });
    }
    return res.status(HTTP_STATUS_CODE.OK).json({
      status: HTTP_STATUS_CODE.OK,
      message: MESSAGE.DATA_UPDATED,
      success: true,
      data: updatedUser,
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
