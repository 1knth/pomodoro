import ytSearch from 'yt-search';
import QUERIES from './videoDiscovery.queries.js';

function pickRandomQueries(count = 3) {
    return [...QUERIES].sort(() => 0.5 - Math.random()).slice(0, count);
}

function mapSearchResultToVideo(video) {
    return {
        id: video.videoId,
        title: video.title,
        thumb: video.thumbnail,
        duration: video.timestamp
    };
}

function removeDuplicateVideos(videos) {
    return [...new Map(videos.map(video => [video.id, video])).values()];
}

async function searchVideos(query) {
    console.log(`:: SCRAPING :: ${query}`);
    const results = await ytSearch(query);
    return results.videos.slice(0, 5).map(mapSearchResultToVideo);
}

export default async function discoverVideos() {
    console.log(":: VIDEO DISCOVERY :: STARTING SEARCH...");
    const videos = [];
    const queries = pickRandomQueries();

    for (const query of queries) {
        try {
            const searchResults = await searchVideos(query);
            videos.push(...searchResults);
        } catch (error) {
            console.error(`:: ERROR :: SEARCH FAILED FOR [${query}]`);
        }
    }

    if (videos.length === 0) {
        console.log(":: VIDEO DISCOVERY :: SEARCH RETURNED 0 RESULTS.");
        return [];
    }

    const uniqueVideos = removeDuplicateVideos(videos);
    console.log(`:: VIDEO DISCOVERY :: ${uniqueVideos.length} VIDEOS READY.`);
    return uniqueVideos;
}
