const Ajv = require("ajv");

const { BadRequestError } = require("../errors/HttpError");

const ajv = new Ajv({ removeAdditional: true });

function formatError(errors) {
  const validationError = errors[0];
  const { message, dataPath } = validationError;

  return `Body ${
    dataPath ? `${dataPath.replace(".", "")} ` : ""
  }${message.replace(".", "")}`;
}

module.exports.schemasValidation = function schemasValidation(schema, data) {
  const validator = ajv.compile(schema);

  const isValid = validator(data);

  if (isValid) return;

  const errorMessage = formatError(validator.errors);

  return new BadRequestError(errorMessage, { description: errorMessage });
};

module.exports.PaginationSchema = PaginationSchema = {
  additionalProperties: false,
  type: "object",
  properties: {
    page: {
      type: "number",
    },
    pageSize: {
      type: "number",
    },
    order: {
      type: "string",
    },
    orderBy: {
      type: "string",
    },
    search: {
      type: "object",
      patternProperties: {
        "^.*$": { type: "string" },
      },
    },
    filter: {
      type: "object",
      patternProperties: {
        "^.*$": {
          type: ["string", "number", "boolean", "object"],
        },
      },
    },
    searchIn: {
      type: "object",
      patternProperties: {
        "^.*$": {
          type: "array",
          items: {
            type: ["string", "number"],
          },
        },
      },
    },
    lowerThan: {
      type: "object",
      patternProperties: {
        "^.*$": {
          type: ["string", "number"],
        },
      },
    },
    lowerEqThan: {
      type: "object",
      patternProperties: {
        "^.*$": {
          type: ["string", "number"],
        },
      },
    },
    greaterThan: {
      type: "object",
      patternProperties: {
        "^.*$": {
          type: ["string", "number"],
        },
      },
    },
    greaterEqThan: {
      type: "object",
      patternProperties: {
        "^.*$": {
          type: ["string", "number"],
        },
      },
    },
  },
};
