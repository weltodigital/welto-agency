import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import db from '../database/init';
import { authenticateToken, requireClientAccess } from '../middleware/auth';

const router = express.Router();

interface AuthRequest extends express.Request {
  user?: {
    id: number;
    username: string;
    role: string;
    client_id?: string;
  };
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xlsx|csv/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Get reports for a client
router.get('/:client_id', authenticateToken, requireClientAccess, (req: AuthRequest, res) => {
  const { client_id } = req.params;

  db.all(
    `SELECT r.*, u.username as uploaded_by_username
     FROM reports r
     LEFT JOIN users u ON r.uploaded_by = u.id
     WHERE r.client_id = ?
     ORDER BY r.created_at DESC`,
    [client_id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(rows);
    }
  );
});

// Upload a new report (admin only)
router.post('/:client_id/upload', authenticateToken, upload.single('file'), (req: AuthRequest, res) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { client_id } = req.params;
  const { title, description, report_type, report_date } = req.body;
  const file_path = req.file ? `/uploads/${req.file.filename}` : null;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  db.run(
    `INSERT INTO reports (client_id, title, description, file_path, report_type, report_date, uploaded_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [client_id, title, description, file_path, report_type, report_date, req.user!.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.status(201).json({
        id: this.lastID,
        client_id,
        title,
        description,
        file_path,
        report_type,
        report_date,
        uploaded_by: req.user!.id
      });
    }
  );
});

// Delete a report (admin only)
router.delete('/:client_id/reports/:report_id', authenticateToken, (req: AuthRequest, res) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { report_id } = req.params;

  // Get file path before deletion
  db.get('SELECT file_path FROM reports WHERE id = ?', [report_id], (err, row: any) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (row?.file_path) {
      const fullPath = path.join(__dirname, '../../', row.file_path);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    db.run('DELETE FROM reports WHERE id = ?', [report_id], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Report deleted successfully' });
    });
  });
});

export default router;