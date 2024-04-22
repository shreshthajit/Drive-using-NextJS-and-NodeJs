const { Tickets } = require('../Models/tickets.model');
const {
  HTTP_STATUS_CODE,
  MESSAGE,
  RESPONSE_TITLES,
} = require('../utilities/constants.utils');
const { TicketsValidator } = require('../validators/schema.validator');

exports.add = async (req, res, next) => {
  try {
    const validatedData = await TicketsValidator.validateAsync({ ...req.body });
    const orders = await Tickets.create(validatedData);
    return res.status(HTTP_STATUS_CODE.CREATED).json({
      status: HTTP_STATUS_CODE.CREATED,
      message: MESSAGE.USER_REGISTERED_SUCCESSFULLY,
      success: true,
      data: { orders },
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
    const results = await Tickets.findOne({ _id: id });
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
    const {
      page = 1,
      limit = 10,
      user_type,
      id,
      organization,
      search = '',
    } = req.query;
    const offset = (page - 1) * limit;
    const countQuery = Tickets.countDocuments({});
    let query;
    if (user_type === 'super_admin')
      query = Tickets.find({
        $or: [
          { reason: { $regex: search, $options: 'i' } },
          { raised_by: { $regex: search, $options: 'i' } },
          { organization: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { status: { $regex: search, $options: 'i' } },
        ],
      })
        .populate('associated_to')
        .skip(offset)
        .limit(limit);
    else if (user_type === 'organization' || user_type === 'org_admin')
      query = Tickets.find({
        $or: [
          { reason: { $regex: search, $options: 'i' } },
          { raised_by: { $regex: search, $options: 'i' } },
          { organization: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { status: { $regex: search | organization, $options: 'i' } },
        ],
      })
        .populate('associated_to')
        .skip(offset)
        .limit(limit);
    else if (user_type === 'user')
      query = Tickets.find({
        $or: [
          { reason: { $regex: search, $options: 'i' } },
          { raised_by: { $regex: search, $options: 'i' } },
          { associated_to: id },
          { organization: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { status: { $regex: search, $options: 'i' } },
        ],
      })
        .populate('associated_to')
        .skip(offset)
        .limit(limit);
    const [results, totalItems] = await Promise.all([
      query.exec(),
      countQuery.exec(),
    ]);
    const totalPages = Math.ceil(totalItems / limit);

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

exports.getAllWithRole = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const { role } = req.params;
    const offset = (page - 1) * limit;
    const countQuery = Tickets.countDocuments({});
    const query = Tickets.find({
      $or: [
        { reason: { $regex: search, $options: 'i' } },
        { raised_by: { $regex: search, $options: 'i' } },
        { associated_to: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { status: { $regex: search, $options: 'i' } },
      ],
    })
      .populate('raised_by')
      .skip(offset)
      .limit(limit);
    const [results, totalItems] = await Promise.all([
      query.exec(),
      countQuery.exec(),
    ]);
    const totalPages = Math.ceil(totalItems / limit);

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
    const results = await Tickets.deleteOne({ _id: id });
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

    const updatedUser = await Tickets.findByIdAndUpdate(
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
