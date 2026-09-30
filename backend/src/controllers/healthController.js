/**
 * Health check controller.
 * Conforms to specification: GET /api/health
 */
export const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: "StaySuite API is running"
  });
};
