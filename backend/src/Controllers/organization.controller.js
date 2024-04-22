const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');
const { Organization } = require('../Models/organizations.schema');
const {
  HTTP_STATUS_CODE,
  MESSAGE,
  RESPONSE_TITLES,
} = require('../utilities/constants.utils');
const { OrganizationValidator } = require('../validators/schema.validator');
require('dotenv').config();

const createToken = (email) => {
  return jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.add = async (req, res, next) => {
  try {
    const validatedData = await OrganizationValidator.validateAsync({
      ...req.body,
    });
    const query = {
      $or: [
        { name: { $regex: new RegExp(validatedData.name, 'i') } },
        { email: { $regex: new RegExp(validatedData.email, 'i') } },
      ],
    };
    let db_data = await Organization.findOne(query);
    if (db_data)
      return res
        .status(HTTP_STATUS_CODE.CONFLICT)
        .json({
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
    const organization = await Organization.create(validatedData);
    return res
      .status(HTTP_STATUS_CODE.CREATED)
      .json({
        status: HTTP_STATUS_CODE.CREATED,
        message: MESSAGE.USER_REGISTERED_SUCCESSFULLY,
        success: true,
        data: { organization },
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

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!password || !email) {
      res
        .status(HTTP_STATUS_CODE.BAD_REQUEST)
        .json({
          code: HTTP_STATUS_CODE.BAD_REQUEST,
          status: RESPONSE_TITLES.ERROR,
          message: MESSAGE.USER_NOT_FOUND,
          data: null,
        });
      return next(error);
    }
    const results = await Organization.findOne({ email });
    var bytes = CryptoJS.AES.decrypt(
      results?.password,
      process.env.ENCRYPTION_KEY
    );
    var dbPassword = bytes.toString(CryptoJS.enc.Utf8);
    if (results && dbPassword !== password)
      return res
        .status(HTTP_STATUS_CODE.BAD_REQUEST)
        .json({
          code: HTTP_STATUS_CODE.BAD_REQUEST,
          status: RESPONSE_TITLES.ERROR,
          message: MESSAGE.USER_NOT_FOUND,
          data: null,
        });

    // Generate JWT token
    const token = createToken(results.email);
    return res
      .status(HTTP_STATUS_CODE.OK)
      .json({
        code: HTTP_STATUS_CODE.OK,
        status: RESPONSE_TITLES.SUCCESS,
        message: MESSAGE.USER_LOGGEDIN_SUCCESSFULLY,
        error: null,
        data: { user: results, token },
      });
  } catch (error) {
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
    const results = await Organization.findOne({ _id: id });
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
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    const countQuery = Organization.countDocuments({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { owner: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { island: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { established: { $regex: search, $options: 'i' } },
      ],
    });
    const query = Organization.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { owner: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { island: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { established: { $regex: search, $options: 'i' } },
      ],
    })
      .skip(offset)
      .limit(limit);
    const [results, totalItems] = await Promise.all([
      query.exec(),
      countQuery.exec(),
    ]);

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
    const results = await Organization.deleteOne({ _id: id });
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

    const updatedUser = await Organization.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedUser) {
      return res
        .status(HTTP_STATUS_CODE.NOT_FOUND)
        .json({
          status: HTTP_STATUS_CODE.NOT_FOUND,
          message: MESSAGE.USER_NOT_FOUND,
          success: false,
          data: null,
        });
    }
    return res
      .status(HTTP_STATUS_CODE.OK)
      .json({
        status: HTTP_STATUS_CODE.OK,
        message: MESSAGE.DATA_UPDATED,
        success: true,
        data: updatedUser,
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
