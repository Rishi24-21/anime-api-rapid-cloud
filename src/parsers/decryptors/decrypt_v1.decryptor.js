import axios from "axios";
import { v1_base_url } from "../../utils/base_v1.js";

/**
 * Fetches and constructs the embed URL for a given episode ID.
 * @param {string} id - The episode ID.
 * @param {string} name - The server name.
 * @param {string} type - The media type (e.g., 'movie', 'tv').
 * @returns {Promise<object|null>} An object with the embed URL or null on error.
 */
export async function decryptSources_v1(id, name, type) {
  try {
    // 1. Fetch the sources data which contains the initial embed link
    const { data: sourcesData } = await axios.get(
      `https://${v1_base_url}/ajax/v2/episode/sources?id=${id}`
    );
    
    // 2. Extract the link from the response
    const ajaxLink = sourcesData?.link;
    
    // 3. Ensure the link exists before proceeding
    if (!ajaxLink) {
      throw new Error("Missing 'link' property in sources data response");
    }
    
    // 4. Construct the final embed URL by appending the required parameters
    const finalEmbedUrl = `${ajaxLink}&autoPlay=1&oa=0&asi=1`;
    
    // 5. Return the structured data
    return {
      id,
      type,
      embedUrl: finalEmbedUrl, // The new URL with added parameters
      server: name,
    };
    
  } catch (error) {
    // Log any errors that occur during the process
    console.error(`Error in decryptSources_v1 for ID "${id}":`, error.message);
    return null;
  }
}
