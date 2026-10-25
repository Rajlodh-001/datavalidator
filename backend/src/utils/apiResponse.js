// Handy response wrappers
const sendSuccess = (res, data, statusCode = 200) => {
  return res.status(statusCode).json(data);
};

const sendError = (res, message, statusCode = 500) => {
  return res.status(statusCode).json({ error: message });
};

module.exports = {
  sendSuccess,
  sendError,
};
