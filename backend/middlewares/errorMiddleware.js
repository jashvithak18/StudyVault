export function notFound(req, res, next) {
  console.log("Invalid path:", req.url)
  res.status(404).json({ message: `path ${req.url} is invalid`})
}
export function errorHandler(err, req, res, next) {
  console.log("Full error:", err);
  console.log("Error name:", err.name);
  console.log("Error code:", err.code);
  if (err.cause) console.log("Error cause:", err.cause);
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: "error occurred", error: err.message });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ message: "error occurred", error: err.message });
  }
  const errCode = err.code ?? err.cause?.code ?? err.errorResponse?.code;
  const keyValue = err.keyValue ?? err.cause?.keyValue ?? err.errorResponse?.keyValue;
  if (errCode === 11000) {
    const field = Object.keys(keyValue)[0];
    const value = keyValue[field];
    return res.status(409).json({
      message: "error occurred",
      error: `${field} "${value}" already exists`,
    });
  }
  res.status(500).json({ message: "error occurred", error: "Server side error" });
}
