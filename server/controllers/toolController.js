const Tool = require('../models/Tool');

const getTools = async (req, res) => {
  try {
    const tools = await Tool.find({ user: req.user._id })
      .populate('emails')
      .sort({ renewalDate: 1 })
      .lean();
    res.json(tools);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addTool = async (req, res) => {
  const { toolName, emails, startDate, endDate, renewalDate, notes } = req.body;
  try {
    const tool = new Tool({
      user: req.user._id,
      toolName,
      emails,
      startDate,
      endDate,
      renewalDate,
      notes
    });
    const createdTool = await tool.save();
    // populate emails before returning
    const populatedTool = await Tool.findById(createdTool._id).populate('emails');
    res.status(201).json(populatedTool);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTool = async (req, res) => {
  const { id } = req.params;
  const { toolName, emails, startDate, endDate, renewalDate, notes } = req.body;
  
  try {
    const tool = await Tool.findById(id);
    if (!tool || tool.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Tool not found' });
    }
    
    // Reset notifications if dates are changed
    if (new Date(endDate).getTime() !== new Date(tool.endDate).getTime()) {
      tool.notifiedExpireSoon = false;
      tool.notifiedExpired = false;
    }
    if (new Date(renewalDate).getTime() !== new Date(tool.renewalDate).getTime()) {
      tool.notifiedRenewal = false;
    }

    tool.toolName = toolName || tool.toolName;
    tool.emails = emails || tool.emails;
    tool.startDate = startDate || tool.startDate;
    tool.endDate = endDate || tool.endDate;
    tool.renewalDate = renewalDate || tool.renewalDate;
    tool.notes = notes !== undefined ? notes : tool.notes;
    
    const updatedTool = await tool.save();
    const populatedTool = await Tool.findById(updatedTool._id).populate('emails');
    res.json(populatedTool);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTool = async (req, res) => {
  const { id } = req.params;
  try {
    const tool = await Tool.findById(id);
    if (!tool || tool.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Tool not found' });
    }
    await tool.deleteOne();
    res.json({ message: 'Tool removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTools, addTool, updateTool, deleteTool };
