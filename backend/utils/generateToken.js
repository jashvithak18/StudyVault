import jwt from 'jsonwebtoken';
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'abcdef', {
    expiresIn: '30d',
  });
};

export default generateToken;
