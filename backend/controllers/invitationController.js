const crypto = require('crypto');
const Invitation = require('../models/Invitation');
const Workspace = require('../models/Workspace');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');

// @desc    Invite a member to a workspace
// @route   POST /api/invitations/invite
// @access  Private (workspace owner only)
exports.inviteMember = async (req, res) => {
  const { email, workspaceId } = req.body;
  try {
    if (!email || !workspaceId) {
      return res.status(400).json({ message: 'Email and workspace ID are required' });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    if (workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the workspace owner can invite members' });
    }

    // Check if user exists and is already a member
    const existingUser = await User.findOne({ email });
    if (existingUser && workspace.members.includes(existingUser._id)) {
      return res.status(400).json({ message: 'User is already a member of this workspace' });
    }

    // ✅ Always generate a new token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Delete any old pending invitation for this email + workspace
    await Invitation.deleteMany({ email, workspace: workspaceId, status: 'pending' });

    // Create new invitation
    await Invitation.create({
      email,
      workspace: workspaceId,
      token,
      status: 'pending',
      expiresAt,
    });

    // Build invite link
    const inviteLink = `${process.env.CLIENT_URL}/accept-invite?token=${token}`;
    console.log('🔗 Invite link (copy this):', inviteLink);

    // ✅ Respond immediately – don't wait for email to send
    res.status(201).json({
      message: 'Invitation created! The user can accept via the link (check server logs if email fails).',
    });

    // ✅ Send email in the background (fire and forget)
    sendEmail(
      email,
      `Invitation to join "${workspace.name}" on Projex`,
      `You have been invited to join the workspace "${workspace.name}". Click the link to accept: ${inviteLink}`
    ).catch(err => console.error('❌ Email send failed (but invite was created):', err.message));

  } catch (error) {
    console.error('❌ Invite error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept an invitation
// @route   GET /api/invitations/accept/:token
// @access  Private (user must be logged in)
exports.acceptInvitation = async (req, res) => {
  const { token } = req.params;
  console.log('🔍 Accept invitation - Received token:', token);
  try {
    // Find pending invitation (not expired)
    const invitation = await Invitation.findOne({
      token,
      status: 'pending',
      expiresAt: { $gt: Date.now() },
    });

    if (!invitation) {
      console.log('❌ No valid invitation found for token:', token);
      // Check if token exists but expired or already used
      const existing = await Invitation.findOne({ token });
      if (existing) {
        if (existing.status !== 'pending') {
          return res.status(400).json({ message: 'This invitation has already been used.' });
        }
        if (existing.expiresAt <= Date.now()) {
          return res.status(400).json({ message: 'This invitation has expired. Please request a new one.' });
        }
      }
      return res.status(400).json({
        message: 'Invalid invitation token. Please request a new invitation.',
      });
    }

    console.log('✅ Invitation found:', invitation);

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Email mismatch – return both emails
    if (user.email !== invitation.email) {
      return res.status(403).json({
        message: 'This invitation was sent to a different email address.',
        invitedEmail: invitation.email,
        currentEmail: user.email,
      });
    }

    const workspace = await Workspace.findById(invitation.workspace);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    if (workspace.members.includes(user._id)) {
      invitation.status = 'accepted';
      await invitation.save();
      return res.json({ message: 'You are already a member of this workspace!' });
    }

    // Add user to workspace
    workspace.members.push(user._id);
    await workspace.save();

    user.workspaces.push(workspace._id);
    await user.save();

    invitation.status = 'accepted';
    await invitation.save();

    const io = req.app.get('io');
    io.to(`user-${user._id}`).emit('notification', {
      message: `You've joined workspace "${workspace.name}"`,
      createdAt: new Date(),
    });

    res.json({
      message: 'Successfully joined the workspace!',
      workspace: workspace.name,
    });
  } catch (error) {
    console.error('❌ Accept invitation error:', error);
    res.status(500).json({ message: error.message });
  }
};
