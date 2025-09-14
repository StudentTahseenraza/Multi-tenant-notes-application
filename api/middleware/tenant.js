export const ensureTenantIsolation = (req, res, next) => {
  if (!req.user || !req.user.tenantId) {
    return res.status(401).json({ message: 'Tenant context required' });
  }
  
  req.tenantId = req.user.tenantId._id;
  next();
};