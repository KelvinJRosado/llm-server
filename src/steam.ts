import { get } from 'http';
import SteamAPI from 'steamapi';

const steam = new SteamAPI(process.env.STEAM_API_KEY || false);
const steamId = await getSteamUserId();

async function getSteamUserId() {
  // TODO: Implement logic to get Steam user ID

  return '76561198071912903';
}

export async function getSteamUserInfo() {
  try {
    const userInfo = await steam.getUserSummary(steamId);

    console.log('Steam User Info:', userInfo);

    return userInfo;
  } catch (error) {
    console.error('Error fetching Steam user info:', error);
    throw error;
  }
}

export async function getSteamUserGames() {
  try {
    const games = await steam.getUserOwnedGames(steamId);

    console.log('Steam User Games:', games);

    return games;
  } catch (error) {
    console.error('Error fetching Steam user games:', error);
    throw error;
  }
}
