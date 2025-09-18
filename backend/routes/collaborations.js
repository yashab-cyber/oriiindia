import express from 'express';
import Collaboration from '../models/Collaboration.js';
import NotificationService from '../services/NotificationService.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all collaborations with filtering and pagination
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      researchArea,
      keyword,
      visibility,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      myCollaborations = false
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = {};

    // Filter by user's collaborations if requested
    if (myCollaborations === 'true') {
      query = {
        $or: [
          { initiator: req.user.id },
          { 'collaborators.user': req.user.id }
        ]
      };
    }

    // Apply filters
    if (status) {
      query.status = status;
    }

    if (type) {
      query.type = type;
    }

    if (researchArea) {
      query.researchAreas = { $in: [new RegExp(researchArea, 'i')] };
    }

    if (keyword) {
      query.keywords = { $in: [new RegExp(keyword, 'i')] };
    }

    if (visibility) {
      query.visibility = visibility;
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const collaborations = await Collaboration.find(query)
      .populate('initiator', 'firstName lastName email profilePicture institution')
      .populate('collaborators.user', 'firstName lastName email profilePicture institution')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .exec();

    // Get total count for pagination
    const total = await Collaboration.countDocuments(query);

    res.json({
      success: true,
      data: {
        collaborations,
        pagination: {
          current: pageNum,
          pages: Math.ceil(total / limitNum),
          total,
          limit: limitNum
        }
      }
    });

  } catch (error) {
    console.error('Error fetching collaborations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch collaborations',
      error: error.message
    });
  }
});

// Get collaboration by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const collaboration = await Collaboration.findById(req.params.id)
      .populate('initiator', 'firstName lastName email profilePicture institution department')
      .populate('collaborators.user', 'firstName lastName email profilePicture institution department')
      .populate('updates.author', 'firstName lastName profilePicture')
      .populate('timeline.milestones.assignedTo', 'firstName lastName email');

    if (!collaboration) {
      return res.status(404).json({
        success: false,
        message: 'Collaboration not found'
      });
    }

    // Check if user has access to view this collaboration
    const isCollaborator = collaboration.initiator._id.toString() === req.user.id ||
      collaboration.collaborators.some(c => c.user._id.toString() === req.user.id);
    
    if (collaboration.visibility === 'private' && !isCollaborator) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Increment view count if not the owner/collaborator
    if (!isCollaborator) {
      collaboration.metrics.views += 1;
      await collaboration.save();
    }

    res.json({
      success: true,
      data: collaboration
    });

  } catch (error) {
    console.error('Error fetching collaboration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch collaboration',
      error: error.message
    });
  }
});

// Create new collaboration
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      researchAreas,
      keywords,
      timeline,
      resources,
      visibility = 'institute',
      tags
    } = req.body;

    const collaboration = new Collaboration({
      title,
      description,
      type,
      researchAreas,
      keywords,
      timeline,
      resources,
      visibility,
      tags,
      initiator: req.user.id
    });

    await collaboration.save();

    // Populate the created collaboration
    await collaboration.populate('initiator', 'firstName lastName email profilePicture institution');

    res.status(201).json({
      success: true,
      message: 'Collaboration created successfully',
      data: collaboration
    });

  } catch (error) {
    console.error('Error creating collaboration:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create collaboration',
      error: error.message
    });
  }
});

// Update collaboration
router.patch('/:id', auth, async (req, res) => {
  try {
    const collaboration = await Collaboration.findById(req.params.id);

    if (!collaboration) {
      return res.status(404).json({
        success: false,
        message: 'Collaboration not found'
      });
    }

    // Check if user has permission to update
    const collaborator = collaboration.collaborators.find(c => 
      c.user.toString() === req.user.id
    );
    
    const canEdit = collaboration.initiator.toString() === req.user.id ||
      (collaborator && collaborator.permissions.canManage);

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }

    const allowedUpdates = [
      'title', 'description', 'type', 'researchAreas', 'keywords',
      'timeline', 'resources', 'visibility', 'tags', 'status'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    Object.assign(collaboration, updates);
    await collaboration.save();

    await collaboration.populate('initiator', 'firstName lastName email profilePicture');

    res.json({
      success: true,
      message: 'Collaboration updated successfully',
      data: collaboration
    });

  } catch (error) {
    console.error('Error updating collaboration:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update collaboration',
      error: error.message
    });
  }
});

// Invite collaborator
router.post('/:id/invite', auth, async (req, res) => {
  try {
    const { userEmail, role = 'contributor', permissions = {} } = req.body;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: 'User email is required'
      });
    }

    const collaboration = await Collaboration.findById(req.params.id)
      .populate('initiator', 'firstName lastName email');

    if (!collaboration) {
      return res.status(404).json({
        success: false,
        message: 'Collaboration not found'
      });
    }

    // Check if user has permission to invite
    const collaborator = collaboration.collaborators.find(c => 
      c.user.toString() === req.user.id
    );
    
    const canInvite = collaboration.initiator._id.toString() === req.user.id ||
      (collaborator && (collaborator.permissions.canInvite || collaborator.permissions.canManage));

    if (!canInvite) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }

    // Find user by email
    const User = require('../models/User.js');
    const invitedUser = await User.findOne({ email: userEmail });

    if (!invitedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // Check if user is already a collaborator
    const existingCollaborator = collaboration.collaborators.find(c => 
      c.user.toString() === invitedUser._id.toString()
    );

    if (existingCollaborator) {
      return res.status(400).json({
        success: false,
        message: 'User is already a collaborator'
      });
    }

    // Add collaborator
    collaboration.collaborators.push({
      user: invitedUser._id,
      role,
      status: 'pending',
      permissions: {
        canEdit: permissions.canEdit || false,
        canInvite: permissions.canInvite || false,
        canManage: permissions.canManage || false
      }
    });

    await collaboration.save();

    // Send notification
    await NotificationService.createCollaborationInvitation(
      invitedUser._id,
      collaboration._id,
      req.user.id,
      {
        collaborationTitle: collaboration.title,
        inviterName: `${req.user.firstName} ${req.user.lastName}`,
        role
      }
    );

    res.json({
      success: true,
      message: 'Collaboration invitation sent successfully'
    });

  } catch (error) {
    console.error('Error inviting collaborator:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send invitation',
      error: error.message
    });
  }
});

// Respond to collaboration invitation
router.post('/:id/respond', auth, async (req, res) => {
  try {
    const { response } = req.body; // 'accept' or 'decline'

    if (!['accept', 'decline'].includes(response)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid response. Must be "accept" or "decline"'
      });
    }

    const collaboration = await Collaboration.findById(req.params.id)
      .populate('initiator', 'firstName lastName email');

    if (!collaboration) {
      return res.status(404).json({
        success: false,
        message: 'Collaboration not found'
      });
    }

    // Find the collaborator record
    const collaborator = collaboration.collaborators.find(c => 
      c.user.toString() === req.user.id && c.status === 'pending'
    );

    if (!collaborator) {
      return res.status(400).json({
        success: false,
        message: 'No pending invitation found'
      });
    }

    // Update status
    collaborator.status = response === 'accept' ? 'accepted' : 'declined';
    if (response === 'accept') {
      collaborator.joinedAt = new Date();
    }

    await collaboration.save();

    // Notify initiator
    const statusText = response === 'accept' ? 'accepted' : 'declined';
    await NotificationService.createCollaborationResponse(
      collaboration.initiator._id,
      collaboration._id,
      req.user.id,
      {
        collaborationTitle: collaboration.title,
        responderName: `${req.user.firstName} ${req.user.lastName}`,
        status: statusText
      }
    );

    res.json({
      success: true,
      message: `Invitation ${statusText} successfully`
    });

  } catch (error) {
    console.error('Error responding to invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to respond to invitation',
      error: error.message
    });
  }
});

// Add collaboration update
router.post('/:id/updates', auth, async (req, res) => {
  try {
    const { title, content, type = 'general', attachments = [] } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    const collaboration = await Collaboration.findById(req.params.id);

    if (!collaboration) {
      return res.status(404).json({
        success: false,
        message: 'Collaboration not found'
      });
    }

    // Check if user is a collaborator
    const isCollaborator = collaboration.initiator.toString() === req.user.id ||
      collaboration.collaborators.some(c => 
        c.user.toString() === req.user.id && c.status === 'accepted'
      );

    if (!isCollaborator) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Add update
    await collaboration.addUpdate(req.user.id, title, content, type, attachments);

    // Notify all collaborators about the update
    const collaboratorIds = collaboration.collaborators
      .filter(c => c.status === 'accepted' && c.user.toString() !== req.user.id)
      .map(c => c.user);
    
    if (collaboration.initiator.toString() !== req.user.id) {
      collaboratorIds.push(collaboration.initiator);
    }

    for (const collaboratorId of collaboratorIds) {
      await NotificationService.createCollaborationUpdate(
        collaboratorId,
        collaboration._id,
        req.user.id,
        {
          collaborationTitle: collaboration.title,
          updateTitle: title,
          authorName: `${req.user.firstName} ${req.user.lastName}`
        }
      );
    }

    res.json({
      success: true,
      message: 'Update added successfully'
    });

  } catch (error) {
    console.error('Error adding update:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add update',
      error: error.message
    });
  }
});

// Update milestone status
router.patch('/:id/milestones/:milestoneId', auth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'in_progress', 'completed', 'overdue'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid milestone status'
      });
    }

    const collaboration = await Collaboration.findById(req.params.id);

    if (!collaboration) {
      return res.status(404).json({
        success: false,
        message: 'Collaboration not found'
      });
    }

    // Check if user is a collaborator
    const isCollaborator = collaboration.initiator.toString() === req.user.id ||
      collaboration.collaborators.some(c => 
        c.user.toString() === req.user.id && c.status === 'accepted'
      );

    if (!isCollaborator) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Find and update milestone
    const milestone = collaboration.timeline.milestones.id(req.params.milestoneId);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found'
      });
    }

    milestone.status = status;
    if (status === 'completed') {
      milestone.completedAt = new Date();
    }

    await collaboration.save();

    res.json({
      success: true,
      message: 'Milestone updated successfully',
      data: milestone
    });

  } catch (error) {
    console.error('Error updating milestone:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update milestone',
      error: error.message
    });
  }
});

// Delete collaboration
router.delete('/:id', auth, async (req, res) => {
  try {
    const collaboration = await Collaboration.findById(req.params.id);

    if (!collaboration) {
      return res.status(404).json({
        success: false,
        message: 'Collaboration not found'
      });
    }

    // Only initiator can delete
    if (collaboration.initiator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the initiator can delete this collaboration'
      });
    }

    await Collaboration.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Collaboration deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting collaboration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete collaboration',
      error: error.message
    });
  }
});

// Get collaboration statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const stats = await Promise.all([
      // Total collaborations
      Collaboration.countDocuments(),
      
      // User's collaborations
      Collaboration.countDocuments({
        $or: [
          { initiator: req.user.id },
          { 'collaborators.user': req.user.id }
        ]
      }),
      
      // Active collaborations
      Collaboration.countDocuments({ status: 'active' }),
      
      // Collaborations by type
      Collaboration.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      
      // Recent collaborations
      Collaboration.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('initiator', 'firstName lastName')
    ]);

    res.json({
      success: true,
      data: {
        totalCollaborations: stats[0],
        userCollaborations: stats[1],
        activeCollaborations: stats[2],
        collaborationsByType: stats[3],
        recentCollaborations: stats[4]
      }
    });

  } catch (error) {
    console.error('Error fetching collaboration stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch collaboration statistics',
      error: error.message
    });
  }
});

export default router;