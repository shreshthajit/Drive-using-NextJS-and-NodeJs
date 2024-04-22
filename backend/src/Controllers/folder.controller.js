const {
  HTTP_STATUS_CODE,
  MESSAGE,
  RESPONSE_TITLES,
} = require('../utilities/constants.utils');
const aws = require('aws-sdk');
const { FolderValidator } = require('../validators/schema.validator');
const { Folder } = require('../Models/folders.schema');
const { File } = require('../Models/files.schema');
// Configure AWS S3
const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.S3_BUCKET_REGION,
});

exports.create = async (req, res, next) => {
  try {
    await FolderValidator.validateAsync({ ...req.body });
    const newFolder = await Folder.create({ ...req.body, user: req.user._id });
    if (!newFolder) {
      return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
        code: HTTP_STATUS_CODE.BAD_REQUEST,
        status: RESPONSE_TITLES.ERROR,
        message: MESSAGE.FAILED_TO_CREATE_FOLDER,
        data: null,
      });
    }
    return res.status(HTTP_STATUS_CODE.CREATED).json({
      status: HTTP_STATUS_CODE.CREATED,
      message: MESSAGE.SUCCESSFUL,
      success: true,
      data: newFolder,
    });
  } catch (error) {
    console.log('Error occurred ', error);
    res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      code: HTTP_STATUS_CODE.BAD_REQUEST,
      status: RESPONSE_TITLES.ERROR,
      message: MESSAGE.FAILED_TO_CREATE_FOLDER,
      data: null,
      error,
    });
    next(error);
  }
};

exports.update = async (req, res, next) => {
  const { id } = req.params;
  const validatedData = await FolderValidator.validateAsync({ ...req.body });
  const updatedDoc = await Folder.findOneAndUpdate({ _id: id, user: req.user._id }, validatedData, { new: true }).lean();
  if (!updatedDoc) {
    return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      code: HTTP_STATUS_CODE.BAD_REQUEST,
      status: RESPONSE_TITLES.ERROR,
      message: MESSAGE.FAILED_TO_UPDATE_FOLDER,
      data: null,
    });
  }
  return res.status(HTTP_STATUS_CODE.CREATED).json({
    status: HTTP_STATUS_CODE.CREATED,
    message: MESSAGE.SUCCESSFUL,
    success: true,
    data: updatedDoc,
  });
};

exports.getOne = async (req, res, next) => {
  const { id } = req.params;
  const result = await Folder.findById(id).populate({
    path: 'parent',
    select: 'name _id',
  }).lean();
  if (!result) {
    return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
      code: HTTP_STATUS_CODE.NOT_FOUND,
      status: RESPONSE_TITLES.NOT_FOUND,
      message: MESSAGE.FOLDER_NOT_FOUND,
      data: null,
    });
  }
  const files = await File.find({ folder: result._id }).lean();
  const filesWithPresignedUrls = await Promise.all(
    (files || [])?.map(async (file) => {
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: file.url,
        Expires: 3600, // Expiry time for the URL in seconds (e.g., 1 hour)
      };
      const preSignedUrl = await s3.getSignedUrlPromise('getObject', params);
      return { ...file, url: preSignedUrl };
    })
  );
  const folders = await Folder.find({ parent: result._id }).lean();
  return res.status(HTTP_STATUS_CODE.OK).json({
    status: HTTP_STATUS_CODE.OK,
    message: MESSAGE.RESPONSE_SUCCESS,
    success: true,
    data: { ...result, files: filesWithPresignedUrls, folders },
  });
};

exports.getAll = async (req, res, next) => {
  const folders = await Folder.find({ user: req.user._id }).lean();
  return res.status(HTTP_STATUS_CODE.OK).json({
    status: HTTP_STATUS_CODE.OK,
    message: MESSAGE.RESPONSE_SUCCESS,
    success: true,
    data: folders,
  });
};

exports.getParentFolders = async (req, res, next) => {
  try {
    // const { name = '', parent = '' } = req.query;
    // const query = {};
    // if (name !== undefined && name !== '') {
    //   query.name = new RegExp(name, 'i');
    // }
    // if (parent !== undefined && parent !== '') {
    //   query.parent = parent;
    // }

    const folders = await Folder.find({ user: req.user._id, parent: null }).lean();
    const files = await File.find({ user: req.user._id, folder: null }).lean();
    const filesWithPresignedUrls = await Promise.all(
      (files || [])?.map(async (file) => {
        const params = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: file.url,
          Expires: 3600, // Expiry time for the URL in seconds (e.g., 1 hour)
        };
        const preSignedUrl = await s3.getSignedUrlPromise('getObject', params);
        return { ...file, url: preSignedUrl };
      })
    );
    return res.status(HTTP_STATUS_CODE.OK).json({
      status: HTTP_STATUS_CODE.OK,
      message: MESSAGE.RESPONSE_SUCCESS,
      success: true,
      data: { folders, files: filesWithPresignedUrls },
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
  const { id } = req.params;
  const result = await Folder.findOneAndDelete({ _id: id, user: req.user._id }).lean();
  if (!result) {
    return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
      code: HTTP_STATUS_CODE.NOT_FOUND,
      status: RESPONSE_TITLES.NOT_FOUND,
      message: MESSAGE.FOLDER_NOT_FOUND,
      data: null,
    });
  }
  // TODO: remove nested folders or files here
  return res.status(HTTP_STATUS_CODE.DELETE_SUCCESS).json({
    status: HTTP_STATUS_CODE.DELETE_SUCCESS,
    message: MESSAGE.DELETE_SUCCESS,
    success: true,
    data: result,
  });
};
