const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const mkdirAsync = promisify(fs.mkdir);

const { File } = require('../models');

exports.postUpload = async (req, res, next) => {
  const { name, type, parentId = 0, isPublic = false, data } = req.body;

  // Check if required fields are present
  if (!name) {
    return res.status(400).json({ message: 'Missing name' });
  }

  if (!type || !['folder', 'file', 'image'].includes(type)) {
    return res.status(400).json({ message: 'Missing or invalid type' });
  }

  if (type !== 'folder' && !data) {
    return res.status(400).json({ message: 'Missing data' });
  }

  // Check if user is authenticated
  const userId = req.user.id;
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Check if parent folder exists if parentId is provided
  if (parentId !== 0) {
    const parentFile = await File.findOne({ _id: parentId, type: 'folder' });
    if (!parentFile) {
      return res.status(400).json({ message: 'Parent not found' });
    }
  }

  let localPath;

  try {
    // Create folder to store files if it doesn't exist
    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    await mkdirAsync(folderPath, { recursive: true });

    // Save file to disk if type is file or image
    if (type === 'file' || type === 'image') {
      localPath = path.join(folderPath, uuidv4());
      const fileData = Buffer.from(data, 'base64');
      await promisify(fs.writeFile)(localPath, fileData);
    }

    // Create file in database
    const file = new File({
      name,
      type,
      userId,
      isPublic,
      parentId,
      localPath: localPath || null,
    });
    await file.save();

    res.status(201).json({ file: { id: file._id, name: file.name } });
  } catch (err) {
    next(err);
  }
};
