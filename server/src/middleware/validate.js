/**
 * validate.js
 * Request body and query validation middleware using Zod.
 */

export function validateBody(schema) {
  return (req, res, next) => {
    try {
      req.validatedBody = schema.parse(req.body);
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: error.errors?.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })) || [error.message],
        },
      });
    }
  };
}
