const Email = require('../models/Email');

const getEmails = async (req, res) => {
  try {
    const emails = await Email.find({ user: req.user._id });
    res.json(emails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addEmail = async (req, res) => {
  const { emailAddress, description } = req.body;
  try {
    const email = new Email({
      user: req.user._id,
      emailAddress,
      description
    });
    const createdEmail = await email.save();
    res.status(201).json(createdEmail);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateEmail = async (req, res) => {
  const { id } = req.params;
  const { emailAddress, description } = req.body;
  try {
    const email = await Email.findById(id);
    if (!email || email.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Email not found' });
    }
    
    email.emailAddress = emailAddress || email.emailAddress;
    email.description = description || email.description;
    
    const updatedEmail = await email.save();
    res.json(updatedEmail);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteEmail = async (req, res) => {
  const { id } = req.params;
  try {
    const email = await Email.findById(id);
    if (!email || email.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Email not found' });
    }
    await email.deleteOne();
    res.json({ message: 'Email removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getEmails, addEmail, updateEmail, deleteEmail };
