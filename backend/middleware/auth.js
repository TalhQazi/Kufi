/**
 * Optional auth: read Bearer token and set req.user.
 * For full JWT verification, use jsonwebtoken and your secret.
 */

function authOptional(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    const token = header.slice(7);
    try {
      // Decode without verify for dev; in production use jwt.verify(token, process.env.JWT_SECRET)
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        req.user = { id: payload.sub || payload.id, supplierId: payload.supplierId || payload.sub || payload.id };
      } else {
        req.user = { id: 'supplier-1', supplierId: 'supplier-1' };
      }
    } catch (_) {
      req.user = { id: 'supplier-1', supplierId: 'supplier-1' };
    }
  } else {
    req.user = { id: 'supplier-1', supplierId: 'supplier-1' };
  }
  next();
}

module.exports = { authOptional };
