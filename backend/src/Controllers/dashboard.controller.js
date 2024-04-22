const { Logs } = require('../Models/logs.schema');
const { Notes } = require('../Models/notes.schema');
const { User } = require('../Models/users.schema');
const { Organization } = require('../Models/organizations.schema');
const {
  HTTP_STATUS_CODE,
  MESSAGE,
  RESPONSE_TITLES,
} = require('../utilities/constants.utils');
const { Tickets } = require('../Models/tickets.model');
const { Customer } = require('../Models/customers.schema');

exports.getAll = async (req, res, next) => {
  try {
    const logsCount = await Logs.countDocuments();
    const notesCount = await Notes.countDocuments();
    const usersCount = await User.countDocuments({
      user_type: { $ne: 'super_admin' },
    });
    const orgsCount = await Organization.countDocuments();
    return res.status(HTTP_STATUS_CODE.OK).json({
      status: HTTP_STATUS_CODE.OK,
      message: MESSAGE.RESPONSE_SUCCESS,
      success: true,
      data: {
        logs: logsCount,
        notes: notesCount,
        users: usersCount,
        organizations: orgsCount,
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

exports.getAllOrg = async (req, res, next) => {
  try {
    const { name } = req.query;
    const usersCount = await Customer.countDocuments({
      user_type: { $ne: 'super_admin' },
      organization: name,
    });
    const ticketsCount = await Tickets.countDocuments({ organization: name });
    return res.status(HTTP_STATUS_CODE.OK).json({
      status: HTTP_STATUS_CODE.OK,
      message: MESSAGE.RESPONSE_SUCCESS,
      success: true,
      data: {
        orders: ticketsCount,
        users: usersCount,
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

exports.getAllUser = async (req, res, next) => {
  try {
    const { id, name } = req.query;
    const usersCount = await User.countDocuments({
      user_type: 'user',
      organization: name,
    });
    const ticketsCount = await Tickets.countDocuments({
      organization: name,
      raised_by: id,
    });
    return res.status(HTTP_STATUS_CODE.OK).json({
      status: HTTP_STATUS_CODE.OK,
      message: MESSAGE.RESPONSE_SUCCESS,
      success: true,
      data: {
        orders: ticketsCount,
        users: usersCount,
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
