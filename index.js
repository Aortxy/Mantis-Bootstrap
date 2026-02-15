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

app.use(express.static('public'));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } 
}));

app.use(express.urlencoded({ extended: true }))

const akunFilePath = path.join(__dirname, 'akun.json');

app.get('/login', (req, res) => {
    if (req.session.loggedIn) {
        return res.redirect('/myadmin'); 
    }
    res.sendFile(path.join(__dirname, 'public', 'login.html')); 
});

app.post('/login', (req, res) => {
    console.log("Login request received");

    const { username, password } = req.body;

    fs.readFile(akunFilePath, 'utf-8', (err, data) => {
        if (err) {
            console.error("Error reading akun.json", err);
            return res.status(500).json({ error: 'Terjadi kesalahan saat memuat data akun.' });
        }
        try {
            const akunList = JSON.parse(data);
            const akun = akunList.find(acc => acc.username === username && acc.password === password);
            
            if (akun) {
                req.session.loggedIn = true; 
                req.session.user = username;
                return res.redirect('/'); 
            } else {
                return res.redirect('/login?error=Username%20atau%20password%20salah!');
            }
        } catch (parseError) {
            console.error("Error parsing JSON", parseError);
            return res.status(500).json({ error: 'Terjadi kesalahan dalam parsing data akun.' });
        }
    });
});

const isAuthenticated = (req, res, next) => {
    if (!req.session.loggedIn) {
        return res.redirect('/login');
    }
    next();
};

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/nodes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'nodes.html'));
});

app.get('/create-panel', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'panel.html'));
});

app.get('/list-user', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'user.html')); 
});

app.get('/list-server', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'server.html')); 
});

app.get('/create-adp', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'adp.html')); 
});

  function getValidKeys() {
    const keyData = fs.readFileSync('key.json');
    const keyList = JSON.parse(keyData);
    return keyList.keys;
}

function getValidKeys() {
    try {
        const filePath = path.join(__dirname, "key.json");

        if (!fs.existsSync(filePath)) {
            console.error("❌ File key.json tidak ditemukan!");
            return [];
        }

        const data = fs.readFileSync(filePath, "utf8");
        const jsonData = JSON.parse(data);

        if (!jsonData.validKeys || !Array.isArray(jsonData.validKeys)) {
            console.error("❌ Format key.json salah! `validKeys` harus berupa array.");
            return [];
        }

        console.log("✅ Daftar valid keys berhasil dimuat:", jsonData.validKeys);
        return jsonData.validKeys;
    } catch (error) {
        console.error("❌ Gagal membaca key.json:", error);
        return [];
    }
}


app.post('/create-server', async (req, res) => {
    const { username, ramOption, key } = req.body;
    console.log(`🔑 Received key: ${key}`);

    // Ambil valid keys dari file key.json
    const validKeys = getValidKeys();

    // Cek apakah validKeys berbentuk array
    if (!Array.isArray(validKeys)) {
        return res.status(500).json({ message: "❌ Terjadi kesalahan saat memuat daftar API key." });
    }

    // Cek apakah key yang dikirim termasuk dalam daftar validKeys
    if (!validKeys.includes(key)) {
        return res.status(403).json({ message: "❌ Kunci key tidak valid!" });
    }

    if (!username || !ramOption) {
        return res.status(400).json({ message: "❌ Semua input harus diisi!" });
    }

    let ram, disk, cpu;

    switch (ramOption) {
        case "panel1gb":
            ram = 1000; disk = 1000; cpu = 50;
            break;
        case "panel2gb":
            ram = 2000; disk = 2000; cpu = 100;
            break;
        case "panel3gb":
            ram = 3000; disk = 3000; cpu = 150;
            break;
        case "panel4gb":
            ram = 4000; disk = 4000; cpu = 200;
            break;
        case "panel5gb":
            ram = 5000; disk = 5000; cpu = 250;
            break;
        case "panel6gb":
            ram = 6000; disk = 6000; cpu = 300;
            break;
        case "panel7gb":
            ram = 7000; disk = 7000; cpu = 350;
            break;
        case "panel8gb":
            ram = 8000; disk = 8000; cpu = 400;
            break;
        case "panel9gb":
            ram = 9000; disk = 9000; cpu = 450;
            break;
        case "panel10gb":
            ram = 10000; disk = 10000; cpu = 500;
            break;
        case "panel11gb":
            ram = 11000; disk = 11000; cpu = 550;
            break;
        case "panel12gb":
            ram = 12000; disk = 12000; cpu = 600;
            break;
        case "panel13gb":
            ram = 13000; disk = 13000; cpu = 650;
            break;
        case "panel14gb":
            ram = 14000; disk = 14000; cpu = 700;
            break;
        case "panel15gb":
            ram = 15000; disk = 15000; cpu = 750;
            break;
        case "panel16gb":
            ram = 16000; disk = 16000; cpu = 800;
            break;
        case "panel17gb":
            ram = 17000; disk = 17000; cpu = 850;
            break;
        case "panel18gb":
            ram = 18000; disk = 18000; cpu = 900;
            break;
        case "panel19gb":
            ram = 19000; disk = 19000; cpu = 950;
            break;
        case "panel20gb":
            ram = 20000; disk = 20000; cpu = 1000;
            break;
        case "unlimited":
            ram = 0; disk = 0; cpu = 0;
            break;
        default:
            return res.status(400).json({ message: "❌ Pilihan RAM tidak valid!" });
    }

    try {
        const response = await fetch(`https://apis.xyrezz.online-server.biz.id/api/cpanel?domain=${domain}&apikey=${apikey}&username=${username}&ram=${ram}&disk=${disk}&cpu=${cpu}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        const data = await response.json();
        if (data.error) {
            return res.status(500).json({ message: `Error: ${data.error}` });
        }

        res.status(200).json({ message: "✅ Server berhasil dibuat!", serverInfo: data });
    } catch (error) {
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
  
  app.get('/api/list-servers', async (req, res) => {
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
