import axios from "axios";
import { v1_base_url } from "../../utils/base_v1.js";

/**
 * Fetches server information for a given episode ID.
 * @param {string} episodeId - The episode ID.
 * @returns {Promise<Array|null>} Array of server objects or null on error.
 */
export async function getEpisodeServers(episodeId) {
  try {
    const { data } = await axios.get(
      `https://${v1_base_url}/ajax/episode/servers?episodeId=${episodeId}`
    );
    
    // The response should be an array of server objects
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Error fetching servers for episode "${episodeId}":`, error.message);
    return null;
  }
}

/**
 * Fetches and constructs the embed URL for a given server data.
 * @param {object} serverData - The server object from the servers endpoint.
 * @param {string} type - The media type (e.g., 'movie', 'tv').
 * @returns {Promise<object|null>} An object with the embed URL or null on error.
 */
export async function decryptSources_v1(serverData, type = 'tv') {
  try {
    // Extract the server ID from the server data
    const serverId = serverData.id || serverData.server;
    
    if (!serverId) {
      throw new Error("Missing server ID in server data");
    }
    
    // 1. Fetch the sources data which contains the initial embed link
    const { data: sourcesData } = await axios.get(
      `https://${v1_base_url}/ajax/episode/sources?id=${serverId}`
    );
    
    // 2. Extract the link from the response
    const ajaxLink = sourcesData?.link;
    
    // 3. Ensure the link exists before proceeding
    if (!ajaxLink) {
      throw new Error("Missing 'link' property in sources data response");
    }
    
    // 4. Check if the link is already a complete embed URL or needs parameters
    let finalEmbedUrl;
    if (ajaxLink.includes('?')) {
      // Link already has parameters, append additional ones
      finalEmbedUrl = `${ajaxLink}&autoPlay=1&oa=0&asi=1`;
    } else {
      // Link needs parameters
      finalEmbedUrl = `${ajaxLink}?autoPlay=1&oa=0&asi=1`;
    }
    
    // 5. Return the structured data
    return {
      id: serverId,
      type,
      embedUrl: finalEmbedUrl,
      server: serverData.server || 'unknown',
      originalLink: ajaxLink,
      serverData: serverData, // Keep original server data for reference
    };
    
  } catch (error) {
    console.error(`Error in decryptSources_v1:`, error.message);
    return null;
  }
}

/**
 * Complete workflow to get all embed URLs for an episode.
 * @param {string} episodeId - The episode ID.
 * @param {string} type - The media type.
 * @returns {Promise<Array|null>} Array of embed URLs or null on error.
 */
export async function getAllEmbedUrls(episodeId, type = 'tv') {
  try {
    // 1. Get all servers for this episode
    const servers = await getEpisodeServers(episodeId);
    
    if (!servers || servers.length === 0) {
      console.log("No servers found for episode:", episodeId);
      return [];
    }
    
    console.log(`Found ${servers.length} servers for episode ${episodeId}`);
    
    // 2. Process each server to get embed URLs
    const embedPromises = servers.map(async (server) => {
      try {
        const result = await decryptSources_v1(server, type);
        if (result) {
          console.log(`✓ Successfully got embed URL for server: ${server.server}`);
        }
        return result;
      } catch (error) {
        console.error(`✗ Failed to get embed URL for server: ${server.server}`, error.message);
        return null;
      }
    });
    
    // 3. Wait for all requests to complete
    const embedResults = await Promise.all(embedPromises);
    
    // 4. Filter out failed requests
    const validEmbeds = embedResults.filter(result => result !== null);
    
    console.log(`Successfully retrieved ${validEmbeds.length} embed URLs`);
    return validEmbeds;
    
  } catch (error) {
    console.error(`Error in getAllEmbedUrls for episode "${episodeId}":`, error.message);
    return null;
  }
}

/**
 * Get a specific server's embed URL.
 * @param {string} episodeId - The episode ID.
 * @param {string} serverName - The server name to look for.
 * @param {string} type - The media type.
 * @returns {Promise<object|null>} Single embed URL object or null.
 */
export async function getSpecificServerEmbed(episodeId, serverName, type = 'tv') {
  try {
    const servers = await getEpisodeServers(episodeId);
    
    if (!servers) {
      return null;
    }
    
    // Find the specific server
    const targetServer = servers.find(server => 
      server.server && server.server.toLowerCase().includes(serverName.toLowerCase())
    );
    
    if (!targetServer) {
      console.log(`Server "${serverName}" not found. Available servers:`, 
        servers.map(s => s.server));
      return null;
    }
    
    console.log(`Found target server:`, targetServer);
    
    // Get embed URL for this specific server
    return await decryptSources_v1(targetServer, type);
    
  } catch (error) {
    console.error(`Error getting specific server embed:`, error.message);
    return null;
  }
}

// Example usage and testing functions:
export async function testEpisodeEmbeds(episodeId) {
  console.log(`\n🔍 Testing episode ${episodeId}...`);
  
  // Test 1: Get all servers
  const servers = await getEpisodeServers(episodeId);
  console.log("Available servers:", servers);
  
  // Test 2: Get all embed URLs
  const embeds = await getAllEmbedUrls(episodeId);
  console.log("All embed URLs:", embeds);
  
  // Test 3: Get specific server (rapid-cloud)
  const rapidCloudEmbed = await getSpecificServerEmbed(episodeId, 'rapid-cloud');
  console.log("Rapid-cloud embed:", rapidCloudEmbed);
  
  return { servers, embeds, rapidCloudEmbed };
}

// Usage examples:
/*
// Test the complete flow
await testEpisodeEmbeds('141568');

// Get all embed URLs for an episode
const allEmbeds = await getAllEmbedUrls('141568');

// Get a specific server's embed
const rapidCloudEmbed = await getSpecificServerEmbed('141568', 'rapid-cloud');

// Use the original function with proper server data
const servers = await getEpisodeServers('141568');
if (servers && servers.length > 0) {
  const firstServerEmbed = await decryptSources_v1(servers[0]);
}
*/
