const toMatchSchema = (received, joiSchema) => {
  const { error } = joiSchema.validate(received);
  const pass = !error;
  if (pass) {
    return {
      message: () => "Success",
      pass,
    };
  } else {
    return {
      message: () => {
        const { details } = error;
        const message = details.map((i) => ({
          message: i.message,
          path: i.path,
          validationFailed: i.type.split(".").pop(),
        }));
        return JSON.stringify(message);
      },
      pass,
    };
  }
};

export default toMatchSchema;
