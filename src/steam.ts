import SteamAPI, { GameInfo } from 'steamapi';

const steam = new SteamAPI(process.env.STEAM_API_KEY || false);

export async function getSteamUserGames(steamId: string): Promise<any> {
  try {
    const games = await steam.getUserOwnedGames(steamId, {
      includeFreeGames: true,
      includeAppInfo: true,
    });

    // Filter out the response to just grab the game names and playtime
    const filteredGames: { name: string; playMinutes?: number }[] = [];

    for (const entry of games) {
      const game = entry.game as GameInfo;
      const filteredGame = { name: game.name, playMinutes: entry.minutes };
      filteredGames.push(filteredGame);
    }

    // Sort the games by playtime in descending order
    filteredGames.sort((a, b) => (b.playMinutes || 0) - (a.playMinutes || 0));

    console.log('Filtered Steam User Games:', filteredGames);

    return filteredGames;
  } catch (error) {
    console.error('Error fetching Steam user games:', error);
    throw error;
  }
}
