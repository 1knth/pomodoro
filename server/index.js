const express = require('express');
const ytSearch = require('yt-search');
const cors = require('cors');
const app = express();
const { exec } = require('child_process');
const path = require('path'); // <--- NEW: Import 'path' module

//middleware
app.use(cors());
app.use(express.json()); // Fix for potential parsing issues
app.use(express.static(path.join(__dirname, 'public')));

const QUERIES = [
"4k city rain walk nyc",
    "4k walking tour seattle rain",
    "4k tokyo night walk rain",
    "4k shibuya crossing rain night",
    "4k london rain walk ambience",
    "4k paris night walk rain",
    "4k hong kong neon night walk",
    "4k seoul gangnam rain walk",
    "4k chicago downtown rain night",
    "4k toronto downtown night walk rain",
    "4k vancouver gastown rain walk",
    "4k osaka dotonbori night walk",
    "4k taipei night market rain",
    "4k singapore marina bay night walk",
    "4k berlin kreuzberg night rain",
    "4k kyoto gion night rain walk",
    "4k manhattan night walk rain",
    "4k rain walk montreal old port",
    
    // --- NORDIC & COLD ATMOSPHERE ---
    "4k walk norway oslo",
    "4k bergen norway rain walk",
    "4k iceland drone landscape",
    "4k reykjavik winter walk",
    "4k stockholm old town snow walk",
    "4k helsinki winter city walk",
    "4k copenhagen rain walk",
    "4k lofoten islands drone norway",
    "4k arctic circle winter landscape",
    "4k swiss alps drone relaxing",
    "4k tromso norway northern lights",
    
    // --- NATURE & HIKING ---
    "4k hike newfoundland canada",
    "4k vancouver pacific spirit park walk",
    "4k banff national park hike",
    "4k olympic national park hoh rainforest",
    "4k redwoods forest walk",
    "4k scottish highlands drone",
    "4k ireland green landscape drone",
    "4k new zealand milford sound nature",
    "4k swiss village walk grindelwald",
    "4k dolomites italy drone",
    "4k autumn forest walk relaxing",
    "4k misty forest walk ambiance",
    "4k japan bamboo forest walk",
    
    // --- EUROPEAN CHARM ---
    "4k walk belgium bruges",
    "4k walk germany rain",
    "4k prague old town morning walk",
    "4k amsterdam canal walk rain",
    "4k vienna city walk winter",
    "4k edinburgh royal mile rain walk",
    
    // --- ABSTRACT & CYBER ---
    "4k cybercity rain",
    "4k cyberpunk neon city loop",
    "4k blade runner ambiance city",
    "4k futuristic city flyover loop"
];

let VAULT = [];



// --- THE SCRAPER KERNEL ---
async function hydrateVault() {
    console.log(":: KERNEL :: INITIATING DEEP SCRAPE...");
    let pool = [];

    // Reduced to 2 queries for speed during "Force Refresh"
    const targets = QUERIES.sort(() => 0.5 - Math.random()).slice(0, 3);

    for (const q of targets) {
        try {
            console.log(`:: SCRAPING :: ${q}`);
            const r = await ytSearch(q);
            
            const videos = r.videos.slice(0, 5).map(v => ({
                id: v.videoId,
                title: v.title,
                thumb: v.thumbnail,
                duration: v.timestamp
            }));

            pool.push(...videos);
        } catch (e) {
            console.error(`:: ERROR :: SIGNAL LOST FOR [${q}]`);
        }
    }

    if (pool.length > 0) {
        // Deduplicate and update
        VAULT = [...new Map(pool.map(v => [v.id, v])).values()];
        console.log(`:: KERNEL :: VAULT HYDRATED. ${VAULT.length} SIGNALS READY.`);
    } else {
        console.log(":: KERNEL :: SCRAPE YIELDED 0 RESULTS. RETAINING OLD CACHE.");
    }
}

// Boot Sequence
hydrateVault();

// --- API ENDPOINTS ---


// 1. Read the Vault
app.get('/api/atmosphere', (req, res) => {
    if (VAULT.length === 0) {
        return res.json([{
            id: 'bF2IxrQLCcQ', 
            title: 'FALLBACK_SIGNAL_RAIN', 
            thumb: 'https://i.ytimg.com/vi/bF2IxrQLCcQ/hqdefault.jpg'
        }]);
    }
    res.json(VAULT);
});



// 2. Force Refresh (The Endpoint Your Button Hits)
app.post('/api/refresh', async (req, res) => {
    try {
        console.log(":: MANUAL OVERRIDE :: RE-HYDRATING VAULT...");
        await hydrateVault(); // Wait for the scrape to finish
        res.json(VAULT);      // Send back the new data
    } catch (error) {
        console.error(":: FATAL ERROR :: REFRESH CRASHED", error);
        res.status(500).json({ error: "Scrape Failed" });
    }
});

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});



const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`:: KOMO SERVER ACTIVE ON PORT ${PORT} ::`));