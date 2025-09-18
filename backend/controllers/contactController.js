import { Contact } from '../models/index.js';

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
export const submitContact = async (req, res) => {
  try {
    const contactData = {
      ...req.body,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        source: 'website',
        referrer: req.get('Referrer')
      }
    };

    const contact = new Contact(contactData);
    await contact.save();

    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully. We will get back to you soon!',
      data: {
        contact: {
          id: contact._id,
          name: contact.name,
          email: contact.email,
          subject: contact.subject,
          category: contact.category,
          createdAt: contact.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Submit contact error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500
      }
    });
  }
};

// @desc    Get all contact submissions
// @route   GET /api/contact
// @access  Private (Admin)
export const getAllContacts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      priority,
      search
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query
    const query = { isArchived: false };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (priority && priority !== 'all') {
      query.priority = priority;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    const [contacts, total] = await Promise.all([
      Contact.find(query)
        .populate('assignedTo', 'firstName lastName')
        .populate('response.respondedBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Contact.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        contacts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500
      }
    });
  }
};

// @desc    Get single contact
// @route   GET /api/contact/:id
// @access  Private (Admin)
export const getContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName profile')
      .populate('response.respondedBy', 'firstName lastName profile');

    if (!contact) {
      return res.status(404).json({
        error: {
          message: 'Contact not found',
          status: 404
        }
      });
    }

    res.json({
      success: true,
      data: {
        contact
      }
    });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500
      }
    });
  }
};

// @desc    Update contact status
// @route   PUT /api/contact/:id/status
// @access  Private (Admin)
export const updateContactStatus = async (req, res) => {
  try {
    const { status, assignedTo, priority } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (priority) updateData.priority = priority;

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'firstName lastName')
      .populate('response.respondedBy', 'firstName lastName');

    if (!contact) {
      return res.status(404).json({
        error: {
          message: 'Contact not found',
          status: 404
        }
      });
    }

    res.json({
      success: true,
      message: 'Contact status updated successfully',
      data: {
        contact
      }
    });
  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500
      }
    });
  }
};

// @desc    Respond to contact
// @route   POST /api/contact/:id/respond
// @access  Private (Admin)
export const respondToContact = async (req, res) => {
  try {
    const { message } = req.body;

    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        error: {
          message: 'Contact not found',
          status: 404
        }
      });
    }

    await contact.respond(message, req.user.id);
    await contact.populate('response.respondedBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Response sent successfully',
      data: {
        contact
      }
    });
  } catch (error) {
    console.error('Respond to contact error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500
      }
    });
  }
};

// @desc    Mark contact as spam
// @route   PUT /api/contact/:id/spam
// @access  Private (Admin)
export const markAsSpam = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        error: {
          message: 'Contact not found',
          status: 404
        }
      });
    }

    await contact.markAsSpam();

    res.json({
      success: true,
      message: 'Contact marked as spam'
    });
  } catch (error) {
    console.error('Mark as spam error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500
      }
    });
  }
};

// @desc    Delete contact
// @route   DELETE /api/contact/:id
// @access  Private (Admin)
export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        error: {
          message: 'Contact not found',
          status: 404
        }
      });
    }

    res.json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500
      }
    });
  }
};