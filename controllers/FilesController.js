const { v4: uuidv4 } = require('uuid');
const { base64ToFile, generateThumbnail } = require('../utils/files');
const File = require('../models/File');
const { fileQueue } = require('../queues');

exports.postUpload = async (req, res) => {
  try {
    const { name, type, parentId = 0, isPublic = false, data } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }
    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing or invalid type' });
    }
    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    // Validate parent folder
    if (parentId !== 0) {
      const parentFile = await File.findOne({
        _id: parentId,
        userId: req.user.id,
        type: 'folder',
      });
      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }
    }

    // Convert data to file if type is image
    let localPath;
    if (type === 'image') {
      const fileExtension = data.match(/^data:image\/(\w+);base64,/)[1];
      const fileName = `${uuidv4()}.${fileExtension}`;
      localPath = `${process.env.FOLDER_PATH || '/tmp/files_manager'}/${fileName}`;
      await base64ToFile(data, localPath);
    }

    // Save file to database
    const newFile = new File({
      userId: req.user.id,
      name,
      type,
      parentId,
      isPublic,
      localPath,
    });
    await newFile.save();

    // Add a job to the queue for generating thumbnails (if file is an image)
    if (type === 'image') {
      fileQueue.add('generateThumbnail', {
        userId: req.user.id,
        fileId: newFile._id,
      });
    }

    res.status(201).json(newFile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
