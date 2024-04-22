const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const mongoose = require('mongoose');
const { File } = require('../Models/files.schema');
const { HTTP_STATUS_CODE, MESSAGE, RESPONSE_TITLES } = require('../utilities/constants.utils');

// Configure AWS S3
const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.S3_BUCKET_REGION,
});

// Multer upload middleware with multer-s3 storage
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'private',
    key: function (req, file, cb) {
      // Generate unique key for file, replacing spaces with dashes
      const filename = Date.now().toString() + '-' + file.originalname.replace(/\s+/g, '-');
      cb(null, filename);
    },
  }),
  // limits: { fileSize: 1024 * 1024 * 100 } // Limiting file size to 100 MB
}).single('file');

// File upload controller
const uploadFile = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      const folder  = req.body.folder || null;
      if (err) {
        console.error('File upload error:', err);
        return res.status(500).json({ error: err?.message || 'File upload failed', data: null, });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file provided', data: null, });
      }

      // Create new file document in the database
      const { originalname, key, mimetype, size } = req.file;
      const fileExtension = originalname.split('.').pop();
      const newFile = new File({
        name: originalname,
        user: req.user._id,
        url: key,
        fileType: mimetype,
        fileSize: size,
        fileExtension,
        folder,
      });

      await newFile.save();

      res.status(201).json({ message: 'File uploaded successfully', data: newFile });
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: error.message || 'Internal server error', data: null, });
  }
};

const getAll = async (req, res, next) => {
  try {
    const { name } = req.query;
    if (!(name ?? '' !== '')) {
      throw new Error('Provide a valid file name')
    }
    const query = {};
    if (name !== undefined && name !== '') {
      query.name = new RegExp(name, 'i');
    }
    // Query to find files for the current user and populate 'folder' and 'user'
    const files = await File.find({ ...query, user: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'folder',
        select: 'name',
      })
      .populate({
        path: 'user',
        select: 'fullname email organization',
      })
      .lean();
    // Generate pre-signed URLs for each file
    const filesWithPresignedUrls = await Promise.all(
      files.map(async (file) => {
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
      data: filesWithPresignedUrls,
    });
  } catch (error) {
    res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      code: HTTP_STATUS_CODE.BAD_REQUEST,
      status: RESPONSE_TITLES.ERROR,
      message: error.message || MESSAGE.BAD_REQUEST,
      data: null,
      error,
    });
    next(error);
  }
};

const getOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await File.findById(id)
      .populate({
        path: 'folder',
        select: 'name',
      })
      .populate({
        path: 'user',
        select: 'fullname email organization',
      })
      .lean();;
    if (!result) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        code: HTTP_STATUS_CODE.NOT_FOUND,
        status: RESPONSE_TITLES.NOT_FOUND,
        message: MESSAGE.FILE_NOT_FOUND,
        data: null,
      });
    }
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: result.url,
      Expires: 3600, // Expiry time for the URL in seconds (e.g., 1 hour)
    };
    const preSignedUrl = await s3.getSignedUrlPromise('getObject', params);
    result.url = preSignedUrl;
    return res.status(HTTP_STATUS_CODE.OK).json({
      status: HTTP_STATUS_CODE.OK,
      message: MESSAGE.RESPONSE_SUCCESS,
      success: true,
      data: result,
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

const getOneBySharedLink = async (req, res, next) => {
  try {
    const { id, link } = req.params;
    const result = await File.findOne({ _id: new mongoose.Types.ObjectId(id), 'sharedLinks.link': link })
      .populate({
        path: 'folder',
        select: 'name',
      })
      .populate({
        path: 'user',
        select: 'fullname email organization',
      })
      .select('-sharedLinks -accessLogs -sharedWith')
      .lean();;
    if (!result) {
      return res.status(HTTP_STATUS_CODE.NOT_FOUND).json({
        code: HTTP_STATUS_CODE.NOT_FOUND,
        status: RESPONSE_TITLES.NOT_FOUND,
        message: MESSAGE.FILE_NOT_FOUND,
        data: null,
      });
    }
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: result.url,
      Expires: 3600, // Expiry time for the URL in seconds (e.g., 1 hour)
    };
    const preSignedUrl = await s3.getSignedUrlPromise('getObject', params);
    result.url = preSignedUrl;
    return res.status(HTTP_STATUS_CODE.OK).json({
      status: HTTP_STATUS_CODE.OK,
      message: MESSAGE.RESPONSE_SUCCESS,
      success: true,
      data: result,
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

const remove = async (req, res, next) => {
  const { id } = req.params;

  try {
    // Find the file in the database
    const file = await File.findOne({ _id: new mongoose.Types.ObjectId(id), user: req.user._id }).lean();
    // If file not found, return 404
    if (!file) {
      return res.status(404).json({ error: 'File not found', data: null, });
    }

    // Delete the file from S3
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: file.url,
    };
    await s3.deleteObject(params).promise();

    // Delete the file from the database
    await File.findByIdAndDelete(id);

    res.status(200).json({ message: 'File deleted successfully', data: file });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ message: error.message || 'Internal server error', data: null, });
  }
};

const update = async (req, res, next) => {
  const { id } = req.params;
  const { folder } = req.body;
  if (!folder) {
    return res.status(404).json({ error: 'Provide the folder ID', data: null, });
  }
  const updatedDoc = await File.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id), user: req.user._id }, { folder }, { new: true });
  if (!updatedDoc) {
    return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      code: HTTP_STATUS_CODE.BAD_REQUEST,
      status: RESPONSE_TITLES.ERROR,
      message: MESSAGE.FAILED_TO_MOVE_FILE,
      data: null,
    });
  }
  return res.status(HTTP_STATUS_CODE.OK).json({
    status: HTTP_STATUS_CODE.OK,
    message: MESSAGE.SUCCESSFUL,
    success: true,
    data: updatedDoc,
  });
};

const shareLink = async (req, res, next) => {
  const { id } = req.params;
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let shareLink = '';
  for (let i = 0; i < 32; i++) {
    shareLink += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  const updatedDoc = await File.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id), user: req.user._id }, { $push: { sharedLinks: { link: shareLink } } }, { new: true });
  if (!updatedDoc) {
    return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      code: HTTP_STATUS_CODE.BAD_REQUEST,
      status: RESPONSE_TITLES.ERROR,
      message: MESSAGE.FAILED_TO_SHARE_FILE,
      data: null,
    });
  }
  return res.status(HTTP_STATUS_CODE.OK).json({
    status: HTTP_STATUS_CODE.OK,
    message: MESSAGE.SUCCESSFUL,
    success: true,
    data: {
      link: `http://localhost:8888/files/shared-file/${id}/link/${shareLink}`
    },
  });
};
module.exports = { uploadFile, getAll, getOne, remove, update, shareLink, getOneBySharedLink };
