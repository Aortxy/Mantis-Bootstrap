const express = require('express');
const axios = require('axios')
const path = require('path')
const fs = require('fs')
const session = require('express-session');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = 3000;

const domain = 'https://mypanell.vestia.icu'; //DOMAIN PANEL
const apikey = 'ptla_I8wLHSLRhxAKlcXNdu3j6AosCDnKoasULxTCXoEI5yp'; // PTLA PANEL

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } 
}));

const akunFilePath = path.join(__dirname, 'sync', 'akun.json');

app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/pages', express.static(path.join(__dirname, 'pages')));
app.use('/dashboard', express.static(path.join(__dirname, 'dashboard')));
app.use('/manage', express.static(path.join(__dirname, 'manage')));

app.get('/login', (req, res) => {
    if (req.session.loggedIn) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'pages', 'login.html'));
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    fs.readFile(akunFilePath, 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Terjadi kesalahan saat memuat data akun.' });
        }
        try {
            const akunList = JSON.parse(data);
            const akun = akunList.find(acc => acc.username === username && acc.password === password);
            
            if (akun) {
                req.session.loggedIn = true; 
                req.session.user = username;
                req.session.validkey = akun.validkey;
                return res.json({ success: true, message: 'Login berhasil!' });
            } else {
                return res.status(401).json({ success: false, error: 'Username atau password salah!' });
            }
        } catch (parseError) {
            return res.status(500).json({ error: 'Terjadi kesalahan dalam parsing data akun.' });
        }
    });
});

app.get('/api/user', (req, res) => {
    if (req.session.loggedIn) {
        res.json({
            loggedIn: true,
            user: req.session.user,
            validkey: req.session.validkey
        });
    } else {
        res.json({ loggedIn: false });
    }
});

const isAuthenticated = (req, res, next) => {
    if (!req.session.loggedIn) {
        return res.redirect('/login');
    }
    next();
};

app.get('/', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard', 'index.html'));
});

app.get('/manage/create', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'manage', 'create.html'));
});

app.get('/manage/list', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'manage', 'list.html'));
});

app.get('/nodes', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'coming-soon.html'));
});

app.get('/list-user', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'under-construction.html'));
});

app.get('/create-adp', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'under-construction.html'));
});



app.post('/create-server', isAuthenticated, async (req, res) => {
    const { name, version, location, memory, disk, key: bodyKey } = req.body;
    const key = bodyKey || req.session.validkey;
    const username = req.session.user;

    console.log(`🔑 Creating server for ${username} with key: ${key}`);

    if (!key) {
        return res.status(403).json({ message: "❌ Kunci key tidak ditemukan!" });
    }

    // Verify key against akun.json (since key.json is gone)
    const accounts = JSON.parse(fs.readFileSync(akunFilePath, 'utf-8'));
    const isValidKey = accounts.some(acc => acc.validkey === key);

    if (!isValidKey) {
        return res.status(403).json({ message: "❌ Kunci key tidak valid!" });
    }

    if (!name || !memory || !disk) {
        return res.status(400).json({ message: "❌ Nama, Memory, dan Disk harus diisi!" });
    }

    // Simple mapping for the external API (can be improved)
    const ram = parseInt(memory);
    const diskSize = parseInt(disk);
    const cpu = 100; // Default CPU 100%

    try {
        // Using the same external API from previous implementation
        const apiUrl = `https://apis.xyrezz.online-server.biz.id/api/cpanel?domain=${domain}&apikey=${apikey}&username=${username}&ram=${ram}&disk=${diskSize}&cpu=${cpu}`;
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        const data = await response.json();
        if (data.error) {
            return res.status(500).json({ message: `Error: ${data.error}` });
        }

        // Add some extra info for the frontend to display
        const serverInfo = {
            id: Math.floor(Math.random() * 1000), // Mock ID if API doesn't provide it
            name: name,
            memory: memory,
            disk: disk,
            version: version,
            location: location,
            ...data
        };

        res.status(200).json({ message: "✅ Server berhasil dibuat!", serverInfo: serverInfo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "❌ Terjadi kesalahan saat membuat server. Harap coba lagi." });
    }
});



app.get('/api/list-users', async (req, res) => {
    try {
        let response = await fetch(`${domain}/api/application/users`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${apikey}`,
            },
        });
        
        let data = await response.json();

        if (data.errors) {
            return res.status(500).json({ error: `❌ *Error:* ${data.errors[0].detail}` });
        }

        let users = data.data;

        if (!users || users.length === 0) {
            return res.status(404).json({ message: '❌ *Tidak ada pengguna yang ditemukan.*' });
        }

        let userList = users.map(user => {
            let userInfo = user.attributes;
            return {
                id: userInfo.id || 'Unknown',
                username: userInfo.username || 'Unknown',
                email: userInfo.email || 'Unknown',
                language: userInfo.language || 'Unknown',
                full_name: userInfo.first_name && userInfo.last_name 
                    ? `${userInfo.first_name} ${userInfo.last_name}`
                    : 'Unknown',
                role: userInfo.root_admin ? 'Admin' : 'User',
                status: userInfo.suspended ? 'Suspended' : 'Active',
                createdAt: userInfo.created_at || 'Unknown',
            };
        });

        res.status(200).json({ data: userList });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: '❌ *Terjadi kesalahan saat mengambil daftar pengguna. Periksa konfigurasi atau coba lagi.*' });
    }
});



  app.delete('/api/delete-user/:id', async (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'ID pengguna tidak diberikan.' });
    try {
        let response = await fetch(`${domain}/api/application/users/${id}`, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apikey}`,
            },
        });
        let result = response.ok ? { message: 'Successfully deleted the user.' } : await response.json();
        if (result.errors) {
            return res.status(404).json({ error: 'User not found or deletion failed.' });
        }
        res.status(200).json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Terjadi kesalahan saat menghapus pengguna.' });
    }
  });
  
  app.get('/api/list-servers', isAuthenticated, async (req, res) => {
    try {
        const page = req.query.page || '1'; 
        const response = await fetch(`${domain}/api/application/servers?page=${page}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apikey}`
            }
        });
        const data = await response.json();
        const servers = data.data;
        if (!servers || servers.length === 0) {
            return res.json({ error: '❌ Tidak ada server yang ditemukan.' });
        }
        const serverList = servers.map(server => ({
            id: server.attributes.id,
            identifier: server.attributes.identifier,
            name: server.attributes.name,
            description: server.attributes.description,
            suspended: server.attributes.suspended,
            memory: server.attributes.limits.memory == 0 ? "unlimited" : `${server.attributes.limits.memory / 1000} GB`,
            disk: server.attributes.limits.disk == 0 ? "unlimited" : `${server.attributes.limits.disk / 1000} GB`,
            cpu: server.attributes.limits.cpu == 0 ? "unlimited" : `${server.attributes.limits.cpu}%`
        }));
  
        res.json({ data: serverList, page: data.meta.pagination.current_page, total_pages: data.meta.pagination.total_pages });
  
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '❌ Terjadi kesalahan saat mengambil daftar server.' });
    }
  });
  app.delete('/api/delete-server/:id', async (req, res) => {
    const srvId = req.params.id;
    if (!srvId) {
        return res.json({ error: 'ID server tidak ditemukan.' });
    }
    try {
        const response = await fetch(`${domain}/api/application/servers/${srvId}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apikey}`
            }
        });
        if (response.ok) {
            return res.json({ message: 'Server berhasil dihapus.' });
        }
        const result = await response.json();
        return res.json({ error: result.errors || 'Server tidak ditemukan.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '❌ Terjadi kesalahan saat menghapus server.' });
    }
  });
  app.post("/create-admin", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Semua input harus diisi!" });
    }

    try {
        const email = `${username}@admin.com`;
        const response = await axios.post(
            `${domain}/api/application/users`,
            {
                email,
                username,
                first_name: "Admin",
                last_name: "Panel",
                password,
                root_admin: true
            },
            {
                headers: {
                    Authorization: `Bearer ${apikey}`,
                    Accept: "application/json",
                    "Content-Type": "application/json"
                }
            }
        );

        const adminData = response.data.attributes;
        return res.json({
            message: "✅ Admin berhasil dibuat!",
            admin: {
                id: adminData.id,
                email: adminData.email,
                username: adminData.username,
                password, 
                domain: domain
            }
        });

    } catch (error) {
        console.error("❌ Error:", error.response?.data || error.message);
        return res.status(500).json({ message: "Gagal membuat admin!" });
    }
});

app.get('/api/nodes', async (req, res) => {
    try {
        const response = await fetch(`${domain}/api/application/nodes`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apikey}`,
                'Accept': 'application/json'
            }
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '❌ Gagal mengambil daftar node.' });
    }
});

app.get('/api/nodes/:id/stats', async (req, res) => {
    const nodeId = req.params.id;

    try {
        // Fetch data node dari Pterodactyl API
        const nodeResponse = await fetch(`${domain}/api/application/nodes/${nodeId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apikey}`,
                'Accept': 'application/json'
            }
        });

        const nodeData = await nodeResponse.json();
        if (!nodeData || !nodeData.attributes) {
            return res.status(404).json({ error: '❌ Node tidak ditemukan.' });
        }

        const { memory, disk, allocated_resources } = nodeData.attributes;

        // Hitung RAM & disk yang tersedia
        const usedRAM = allocated_resources.memory || 0;
        const freeRAM = memory - usedRAM;
        const usedDisk = allocated_resources.disk || 0;
        const freeDisk = disk - usedDisk;

        res.json({
            node_id: nodeId,
            total_ram: `${memory} MB`,
            used_ram: `${usedRAM} MB`,
            free_ram: `${freeRAM} MB`,
            total_disk: `${disk} MB`,
            used_disk: `${usedDisk} MB`,
            free_disk: `${freeDisk} MB`
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '❌ Terjadi kesalahan saat mengambil informasi node.' });
    }
});


app.listen(port, async () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
