const multer = require("multer");

// Default:  10 Megabytes
const DEFAULT_FILE_SIZE = 10 * 1000000;
/**
 * @name setMiddlewareUploadName
 * @param {{name: String, multiple?: Boolean, maxUploads?: Number,limits?:{fileSize?: Number, fileFilter?: Function}}} opts
 */
module.exports.setMiddlewareUploadName = (opts) => {
  let name = opts;
  let multiple = false;
  let maxUploads = 5;
  const options = {
    limits: {
      fileSize: DEFAULT_FILE_SIZE,
    },
  };

  if (typeof opts === "object") {
    const {
      name: nameParam,
      multiple: multipleParam,
      maxUploads: maxUploadsParam,
      ...others
    } = opts;

    name = nameParam;

    if (!nameParam) throw new Error("Upload field 'name' property is missing.");

    multiple = multipleParam || multiple;
    maxUploads = maxUploadsParam || maxUploads;
    if (others) {
      Object.assign(options, others);
    }
  }

  upload = multer({ dest: `uploads/${name}`, ...options });

  if (multiple) return upload.single(name, maxUploads);

  return upload.array(name, maxUploads);
};
