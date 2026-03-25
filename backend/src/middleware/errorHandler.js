export const notFoundHandler = (req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
};

export const errorHandler = (error, _req, res, _next) => {
  console.error(error);

  if (error.name === 'MulterError') {
    return res.status(400).json({ message: error.message });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      message: 'A record with the same unique field already exists.',
      details: error.keyValue
    });
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation failed.',
      details: Object.values(error.errors).map((entry) => entry.message)
    });
  }

  return res.status(error.statusCode || 500).json({
    message: error.message || 'Something went wrong on the server.'
  });
};
