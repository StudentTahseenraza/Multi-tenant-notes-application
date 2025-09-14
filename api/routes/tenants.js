import express from 'express';
import Tenant from '../models/Tenant.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { ensureTenantIsolation } from '../middleware/tenant.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Upgrade tenant subscription (Admin only)
router.post('/:slug/upgrade', requireRole(['admin']), async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Ensure admin can only upgrade their own tenant
    if (req.user.tenantId.slug !== slug) {
      return res.status(403).json({ message: 'Cannot upgrade other tenants' });
    }

    const tenant = await Tenant.findOneAndUpdate(
      { slug },
      { 
        plan: 'pro',
        noteLimit: -1 // Unlimited
      },
      { new: true }
    );

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    res.json({
      message: 'Tenant upgraded to Pro successfully',
      tenant
    });
  } catch (error) {
    console.error('Upgrade tenant error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;