const Server = require('../models/Server');
const ptero = require('../utils/ptero');

const getServers = async (req, res) => {
  try {
    const servers = await Server.find({ ownerId: req.user.userId });
    res.json(servers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createResellerServer = async (req, res) => {
  const { name, ram } = req.body;
  try {
    const pteroResult = await ptero.createServer({
      username: req.user.username + Math.floor(Math.random() * 1000),
      email: req.user.email,
      ram: ram,
      nestId: process.env.PTERO_NEST_ID,
      eggId: process.env.PTERO_EGG_ID,
      locationId: process.env.PTERO_LOCATION_ID
    });

    const newServer = new Server({
      serverId: pteroResult.serverId,
      name: name,
      ownerId: req.user.userId,
      memory: parseInt(ram) / 1024,
      panelUrl: pteroResult.panel
    });
    await newServer.save();

    res.json({ message: 'Server created successfully', data: pteroResult });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteResellerServer = async (req, res) => {
  try {
    const server = await Server.findOne({ serverId: req.params.id, ownerId: req.user.userId });
    if (!server) return res.status(404).json({ message: 'Server not found or unauthorized' });

    await ptero.deleteServer(server.serverId);
    await Server.deleteOne({ _id: server._id });

    res.json({ message: 'Server deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getServers, createResellerServer, deleteResellerServer };
