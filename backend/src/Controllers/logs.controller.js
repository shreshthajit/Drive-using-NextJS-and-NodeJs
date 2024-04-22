const { Logs } = require("../Models/logs.schema");
const { HTTP_STATUS_CODE, MESSAGE, RESPONSE_TITLES } = require("../utilities/constants.utils");
const { LogsValidator } = require("../validators/schema.validator");

exports.add = async (req, res, next) => {
    try {
        // const validatedData = await LogsValidator.validateAsync({ ...req.body });
        const logs = await Logs.create(req.body);
        return res.status(HTTP_STATUS_CODE.CREATED).json({ status: HTTP_STATUS_CODE.CREATED, message: MESSAGE.USER_REGISTERED_SUCCESSFULLY, success: true, data: { logs } });
    } catch (error) {
        console.log("Error occurred ", error);
        res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ code: HTTP_STATUS_CODE.BAD_REQUEST, status: RESPONSE_TITLES.ERROR, message: MESSAGE.USER_NOT_FOUND, data: null, error });
        next(error);
    }
};

exports.getOne = async (req, res, next) => {
    try {
        const { id } = req.params;
        const results = await Logs.findOne({ _id: id });
        return res.status(HTTP_STATUS_CODE.OK).json({ status: HTTP_STATUS_CODE.OK, message: MESSAGE.RESPONSE_SUCCESS, success: true, data: results });
    } catch (error) {
        res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ code: HTTP_STATUS_CODE.BAD_REQUEST, status: RESPONSE_TITLES.ERROR, message: MESSAGE.BAD_REQUEST, data: null, error });
        next(error);
    }
};

exports.getAll = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, added_by = '' } = req.query;
        const offset = (page - 1) * limit;
        const countQuery = added_by ? Logs.countDocuments({ added_by }) : Logs.countDocuments({ });
        const query = added_by ?  Logs.find({ added_by }).populate("user").skip(offset).limit(limit) : Logs.find({ }).populate("user").skip(offset).limit(limit);
        const [results, totalItems] = await Promise.all([
            query.exec(),
            countQuery.exec(),
        ]);
        const totalPages = Math.ceil(totalItems / limit);

        return res.status(HTTP_STATUS_CODE.OK).json({
            status: HTTP_STATUS_CODE.OK, message: MESSAGE.RESPONSE_SUCCESS, success: true, data: {
                results,
                totalItems,
                totalPages,
                currentPage: page,
            }
        });
    } catch (error) {
        res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ code: HTTP_STATUS_CODE.BAD_REQUEST, status: RESPONSE_TITLES.ERROR, message: MESSAGE.BAD_REQUEST, data: null, error });
        next(error);
    }
};

exports.remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        const results = await Logs.deleteOne({ _id: id });
        return res.status(HTTP_STATUS_CODE.DELETE_SUCCESS).json({ status: HTTP_STATUS_CODE.DELETE_SUCCESS, message: MESSAGE.DELETE_SUCCESS, success: true, data: results });
    } catch (error) {
        res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({ code: HTTP_STATUS_CODE.BAD_REQUEST, status: RESPONSE_TITLES.ERROR, message: MESSAGE.BAD_REQUEST, data: null, error });
        next(error);
    }
};