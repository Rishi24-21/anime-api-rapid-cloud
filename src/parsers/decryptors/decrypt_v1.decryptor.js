import axios from "axios";
import { v1_base_url } from "../../utils/base_v1.js";

/**
 * Fetches and constructs the embed URL for a given SERVER ID.
 * NOTE: The 'id' parameter must be the SERVER ID, not the episode ID.
 * @param {string} serverId - The ID of the server (e.g., the '4' from your example response).
 * @param {string} name - The server name.
 * @param {string} type - The media type (e.g., 'movie', 'tv').
 * @returns {Promise<object|null>} An object with the embed URL or null on error.
 */
export async function decryptSources_v1(serverId, name, type) {
  try {
    // 1. Fetch the server data which contains the embed link.
    //    The URL is changed from /sources to /servers to get the correct data.
    const { data: serverData } = await axios.get(
      `https://${v1_base_url}/ajax/episode/servers?id=${serverId}`
    );
    
    // 2. Extract the link from the response (this will now work)
    const ajaxLink = serverData?.link;
    
    // 3. Ensure the link exists before proceeding
    if (!ajaxLink) {
      // The response from /servers did not have a 'link' property.
      throw new Error("Missing 'link' property in server data response");
    }
    
    // 4. Construct the final embed URL by appending the required parameters
    const finalEmbedUrl = `${ajaxLink}&autoPlay=1&oa=0&asi=1`;
    
    // 5. Return the structured data
    return {
      id: serverId, // Returning the serverId used
      type,
      embedUrl: finalEmbedUrl, // The new URL with added parameters
      server: name,
    };
    
  } catch (error) {
    // Log any errors that occur during the process
    console.error(`Error in decryptSources_v1 for server ID "${serverId}":`, error.message);
    return null;
  }
}
