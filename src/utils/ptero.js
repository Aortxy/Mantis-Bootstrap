const fetch = require('node-fetch');

const PTERO_DOMAIN = process.env.PTERO_DOMAIN;
const PTERO_API_KEY = process.env.PTERO_API_KEY;

const headers = {
  Authorization: `Bearer ${PTERO_API_KEY}`,
  "Content-Type": "application/json",
  Accept: "application/json"
};

const ramMapping = {
  "1024": { ram: "1000", disk: "1000", cpu: "40" },
  "2048": { ram: "2000", disk: "1000", cpu: "60" },
  "3072": { ram: "3000", disk: "2000", cpu: "80" },
  "4096": { ram: "4000", disk: "2000", cpu: "100" },
  "5120": { ram: "5000", disk: "3000", cpu: "120" },
  "6144": { ram: "6000", disk: "3000", cpu: "140" },
  "7168": { ram: "7000", disk: "4000", cpu: "160" },
  "8192": { ram: "8000", disk: "4000", cpu: "180" },
  "9216": { ram: "9000", disk: "5000", cpu: "200" },
  "10240": { ram: "10000", disk: "5000", cpu: "220" },
  "unlimited": { ram: "0", disk: "0", cpu: "0" } // 0 usually means unlimited in Ptero
};

const createServer = async ({ username, email, ram, nestId, eggId, locationId }) => {
  const spec = ramMapping[ram] || ramMapping["1024"];
  const password = `${username.toLowerCase()}001`;
  const name = `${username.charAt(0).toUpperCase() + username.slice(1)} Server`;

  try {
    // Create User first or find existing
    const userPayload = {
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      first_name: username,
      last_name: "User",
      password,
      language: "en"
    };

    let userRes = await fetch(`${PTERO_DOMAIN}/api/application/users`, {
      method: "POST",
      headers,
      body: JSON.stringify(userPayload)
    });

    let userJson = await userRes.json();

    // If user exists, we might get an error, but we should try to find them
    if (!userRes.ok) {
       // Try to find user by email
       const searchRes = await fetch(`${PTERO_DOMAIN}/api/application/users?filter[email]=${email}`, { headers });
       const searchJson = await searchRes.json();
       if (searchJson.data && searchJson.data.length > 0) {
         userJson = searchJson.data[0];
       } else {
         throw new Error("Failed to create or find user: " + JSON.stringify(userJson));
       }
    }

    const userId = userJson.attributes.id;

    // Get Egg info for startup/docker
    const eggRes = await fetch(`${PTERO_DOMAIN}/api/application/nests/${nestId}/eggs/${eggId}`, { headers });
    const eggJson = await eggRes.json();

    if (!eggRes.ok) throw new Error("Failed to get egg info");

    const startup = eggJson.attributes.startup;
    const docker = eggJson.attributes.docker_image;

    const serverPayload = {
      name,
      user: userId,
      egg: parseInt(eggId),
      docker_image: docker,
      startup,
      limits: {
        memory: parseInt(spec.ram),
        swap: 0,
        disk: parseInt(spec.disk),
        io: 500,
        cpu: parseInt(spec.cpu)
      },
      feature_limits: {
        databases: 2,
        backups: 2,
        allocations: 1
      },
      environment: eggJson.attributes.environment || {}, // Use egg's default environment
      deploy: {
        locations: [parseInt(locationId)],
        dedicated_ip: false,
        port_range: []
      },
      start_on_completion: true
    };

    const serverRes = await fetch(`${PTERO_DOMAIN}/api/application/servers`, {
      method: "POST",
      headers,
      body: JSON.stringify(serverPayload)
    });

    const serverJson = await serverRes.json();
    if (!serverRes.ok) throw new Error("Failed to create server: " + JSON.stringify(serverJson));

    return {
      status: true,
      panel: PTERO_DOMAIN,
      user: username.toLowerCase(),
      pass: password,
      serverId: serverJson.attributes.id
    };

  } catch (err) {
    console.error("Ptero Create Error:", err);
    throw err;
  }
};

const deleteServer = async (serverId) => {
  const response = await fetch(`${PTERO_DOMAIN}/api/application/servers/${serverId}`, {
    method: "DELETE",
    headers
  });
  if (response.status !== 204) {
    const text = await response.text();
    throw new Error(`Failed to delete server ${serverId}: ${text}`);
  }
  return true;
};

const listServers = async () => {
  const response = await fetch(`${PTERO_DOMAIN}/api/application/servers`, { headers });
  if (!response.ok) throw new Error("Failed to list servers");
  const data = await response.ok ? await response.json() : null;
  return data ? data.data : [];
};

module.exports = { createServer, deleteServer, listServers };
