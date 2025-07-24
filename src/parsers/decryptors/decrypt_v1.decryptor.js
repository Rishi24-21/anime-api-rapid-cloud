import axios from "axios";
import { v1_base_url } from "../../utils/base_v1.js";

export async function decryptSources_v1(serverId, name, type) {
  try {
    // Call the correct endpoint that gives you the JSON with the "link"
    const { data: serverData } = await axios.get(
      `https://${v1_base_url}/ajax/episode/servers?id=${serverId}`
    );
    
    // Grab the link from the response object
    const ajaxLink = serverData?.link; // This is the simple "grab"
    
    if (!ajaxLink) {
      throw new Error("Missing 'link' property in server data response");
    }
    
    // Construct the final URL
    const finalEmbedUrl = `${ajaxLink}&autoPlay=1&oa=0&asi=1`;
    
    return {
      id: serverId,
      type,
      embedUrl: finalEmbedUrl,
      server: name,
    };
    
  } catch (error) {
    console.error(`Error in decryptSources_v1 for server ID "${serverId}":`, error.message);
    return null;
  }
}    
