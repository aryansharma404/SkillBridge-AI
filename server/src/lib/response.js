export function sendSuccess(res, data, message = 'Success', status = 200) {
  return res.status(status).json({
    data,
    message
  });
}

export function sendError(res, code, message, status = 400, details = []) {
  return res.status(status).json({
    error: {
      code,
      message,
      details
    }
  });
}
