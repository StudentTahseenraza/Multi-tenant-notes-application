import express from 'express';
import Note from '../models/Note.js';
import { authenticateToken } from '../middleware/auth.js';
import { ensureTenantIsolation } from '../middleware/tenant.js';

const router = express.Router();

// Apply authentication and tenant isolation to all routes
router.use(authenticateToken);
router.use(ensureTenantIsolation);

// Create note
router.post('/', async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    // Check note limit for free plan
    if (req.user.tenantId.plan === 'free') {
      const noteCount = await Note.countDocuments({ tenantId: req.tenantId });
      if (noteCount >= req.user.tenantId.noteLimit) {
        return res.status(403).json({ 
          message: 'Note limit reached. Upgrade to Pro for unlimited notes.',
          code: 'NOTE_LIMIT_REACHED'
        });
      }
    }

    const note = new Note({
      title,
      content,
      authorId: req.user._id,
      tenantId: req.tenantId
    });

    await note.save();
    await note.populate('authorId', 'email');

    res.status(201).json(note);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all notes for current tenant
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find({ tenantId: req.tenantId })
      .populate('authorId', 'email')
      .sort({ createdAt: -1 });

    res.json(notes);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get specific note
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findOne({ 
      _id: req.params.id, 
      tenantId: req.tenantId 
    }).populate('authorId', 'email');

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update note
router.put('/:id', async (req, res) => {
  try {
    const { title, content } = req.body;

    const note = await Note.findOneAndUpdate(
      { 
        _id: req.params.id, 
        tenantId: req.tenantId,
        authorId: req.user._id // Only author can update
      },
      { title, content },
      { new: true }
    ).populate('authorId', 'email');

    if (!note) {
      return res.status(404).json({ message: 'Note not found or unauthorized' });
    }

    res.json(note);
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete note
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ 
      _id: req.params.id, 
      tenantId: req.tenantId,
      authorId: req.user._id // Only author can delete
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found or unauthorized' });
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;