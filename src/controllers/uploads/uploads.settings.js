const IMAGE_STATIC_EXTENSIONS = ["png", "jpg", "jpeg"];
const IMAGE_GIF_EXTENSIONS = ["gif"];
const PDF_EXTENSIONS = ["pdf"];
const DOC_EXTENSIONS = ["doc", "docx"];

const AVATAR_ALLOWED_EXTENSIONS = [...IMAGE_STATIC_EXTENSIONS];

const isValidExtension = (list, ext) => list.indexOf(ext) !== -1;

module.exports.ProfileOpts = {
  name: "avatar",
  dest: undefined,
  limits: {
    fileSize: 1 * 1000000, // 1 MB
  },
  fileFilter: (req, file, cb) => {
    const parts = file.originalname.split(".");
    const ext = parts[parts.length - 1];
    const isValid = AVATAR_ALLOWED_EXTENSIONS.indexOf(ext) !== -1;
    if (!isValid) {
      return cb(
        new Error(
          `Please upload a valid file extension: ${AVATAR_ALLOWED_EXTENSIONS.join(
            ", "
          )}.`
        )
      );
    }
    cb(undefined, true);
  },
};
