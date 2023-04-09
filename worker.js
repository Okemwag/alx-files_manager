const Bull = require('bull');
const thumbnail = require('image-thumbnail');

// create a Bull queue
const fileQueue = new Bull('fileQueue');

// process the queue
fileQueue.process(async (job) => {
  const { fileId, userId } = job.data;

  if (!fileId) {
    throw new Error('Missing fileId');
  }

  if (!userId) {
    throw new Error('Missing userId');
  }

  // retrieve the file document from DB
  const file = await File.findOne({ _id: fileId, userId: userId }).exec();

  if (!file) {
    throw new Error('File not found');
  }

  if (file.type !== 'image') {
    throw new Error('File is not an image');
  }

  // generate thumbnails
  const options = { width: 500 };
  const thumbnail500 = await thumbnail(file.localPath, options);
  const path500 = file.localPath + '_500';
  await fs.promises.writeFile(path500, thumbnail500);

  options.width = 250;
  const thumbnail250 = await thumbnail(file.localPath, options);
  const path250 = file.localPath + '_250';
  await fs.promises.writeFile(path250, thumbnail250);

  options.width = 100;
  const thumbnail100 = await thumbnail(file.localPath, options);
  const path100 = file.localPath + '_100';
  await fs.promises.writeFile(path100, thumbnail100);

  console.log(`Thumbnails generated for file ${fileId}`);
});
