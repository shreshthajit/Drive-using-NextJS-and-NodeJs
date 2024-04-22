const { Customer } = require('../Models/customers.schema');
const {
  HTTP_STATUS_CODE,
  MESSAGE,
  RESPONSE_TITLES,
} = require('../utilities/constants.utils');
const { CustomerValidator } = require('../validators/schema.validator');
const fs = require('fs');
require('dotenv').config();
const path = require('path');

exports.add = async (req, res, next) => {
  try {
    const baseUrl = req.protocol + '://' + req.get('host');
    const filePaths = req.files.map((file) => `${baseUrl}/${file.path}`);

    const totalItems = await Customer.countDocuments({});
    let customer_id = `CUS-${totalItems + 1}`;
    req.body.customer_id = customer_id;
    req.body.attachments = filePaths;
    const validatedData = await CustomerValidator.validateAsync({
      ...req.body,
    });
    let db_user = await Customer.findOne({ email: validatedData.email });
    if (db_user)
      return res.status(HTTP_STATUS_CODE.CONFLICT).json({
        status: HTTP_STATUS_CODE.NOT_FOUND,
        message: MESSAGE.DUPLICATE_RECORD,
        success: false,
        data: { data: MESSAGE.DUPLICATE_RECORD },
      });
    const user = await Customer.create(validatedData);
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
    const results = await Customer.findOne({ _id: id });
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

exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, organization = '', search = '' } = req.query;
    const offset = (page - 1) * limit;
    const totalItems = await Customer.countDocuments({
      $or: [
        { fullname: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { island: { $regex: search, $options: 'i' } },

        { organization: { $regex: search | organization, $options: 'i' } },
      ],
    });
    const u_query = organization
      ? Customer.find({
          $or: [
            { fullname: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } },
            { address: { $regex: search, $options: 'i' } },
            { state: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { island: { $regex: search, $options: 'i' } },

            { organization: { $regex: search | organization, $options: 'i' } },
          ],
        })
      : Customer.find({
          $or: [
            { fullname: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } },
            { address: { $regex: search, $options: 'i' } },
            { state: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { island: { $regex: search, $options: 'i' } },

            { organization: { $regex: search | organization, $options: 'i' } },
          ],
        });
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
    const results = await Customer.deleteOne({ _id: id });
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

exports.removeFile = async (req, res, next) => {
  try {
    const { file } = req.body;
    const fileName = path.basename(file);

    const filePath = path.join(__dirname, '../..', 'uploads', fileName);
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
          res.status(500).json({ error: 'Failed to delete file' });
        } else {
          console.log('File deleted:', file);
          return res.status(HTTP_STATUS_CODE.DELETE_SUCCESS).json({
            status: HTTP_STATUS_CODE.DELETE_SUCCESS,
            message: MESSAGE.FILE_DELETED,
            success: true,
            data: null,
          });
        }
      });
    } else {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        status: HTTP_STATUS_CODE.NOT_FOUND,
        message: MESSAGE.FILE_NOT_FOUND,
        success: false,
        data: null,
      });
    }
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
    const baseUrl = req.protocol + '://' + req.get('host');

    let filePaths;

    const findUser = await Customer.findById(id);

    if (req?.files) {
      filePaths = req?.files?.map((file) => `${baseUrl}/${file.path}`);
      updateFields.attachments = findUser.attachments.concat(filePaths);
    }
    const updatedUser = await Customer.findByIdAndUpdate(
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
