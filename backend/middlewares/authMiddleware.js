import jwt from 'jsonwebtoken'
const { verify } = jwt
//verify JWT token 
export function verifyToken(req, res, next) {
  let token = req.cookies?.token
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  console.log("Token in verification:", token)
  if (!token) {
    return res.status(401).json({ message: "Please login" })
  }
  try {
    const decodedToken = verify(token, process.env.JWT_SECRET || 'abcdef')
    req.user = decodedToken
    console.log("Decoded Token:", decodedToken)
    next()
  } catch (err) {
    res.status(401).json({ message: "Session expired.Please re-login" })
  }
}
//restrict route access based on user role 
export function verifyRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied. Unauthorized role." })
    }
    next()
  }
}
