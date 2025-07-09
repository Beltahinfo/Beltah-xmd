const { keith } = require("../keizzah/keith");
const axios = require('axios');
const { sendMessage, repondre } = require(__dirname + "/../keizzah/context");
const { HEROKU_API_KEY, HEROKU_APP_NAME } = process.env;

keith({
  nomCom: "commit",
  categorie: "Heroku",
  reaction: "🛠️",
  ownerOnly: true,
  description: "Check for new GitHub commits and trigger redeploy on Heroku."
}, async (origineMessage, zk, { ms, arg, repondre }) => {
  if (!HEROKU_API_KEY || !HEROKU_APP_NAME) {
    return repondre('⚠️ HEROKU_API_KEY or HEROKU_APP_NAME is not set in environment.');
  }
  const subcommand = arg[0]?.toLowerCase();

  try {
    if (subcommand === 'now') {
      await repondre('🚀 Updating bot now. Please wait 1-2 minutes...');
      await axios.post(
        `https://api.heroku.com/apps/${HEROKU_APP_NAME}/builds`,
        {
          source_blob: {
            url: 'https://github.com/Beltahinfo/Beltah-xmd/tarball/main'
          }
        },
        {
          headers: {
            Authorization: `Bearer ${HEROKU_API_KEY}`,
            Accept: 'application/vnd.heroku+json; version=3',
            'Content-Type': 'application/json'
          }
        }
      );
      return repondre('✅ Redeploy triggered successfully!');
    }

    // Check for new commits
    const githubRes = await axios.get(
      'https://api.github.com/repos/Beltahinfo/Beltah-xmd/commits/main'
    );
    const latestCommit = githubRes.data;
    const latestSha = latestCommit.sha;

    const herokuRes = await axios.get(
      `https://api.heroku.com/apps/${HEROKU_APP_NAME}/builds`,
      {
        headers: {
          Authorization: `Bearer ${HEROKU_API_KEY}`,
          Accept: 'application/vnd.heroku+json; version=3'
        }
      }
    );
    const lastBuild = herokuRes.data[0];
    const deployedSha = lastBuild?.source_blob?.url || '';
    const alreadyDeployed = deployedSha.includes(latestSha);

    if (alreadyDeployed) {
      return repondre('✅ Bot is already up to date with the latest commit.');
    }

    return repondre(
      `🆕 New commit found!\n\n*Message:* ${latestCommit.commit.message}\n*Author:* ${latestCommit.commit.author.name}\n\nType *update now* to update your bot.`
    );
  } catch (error) {
    const errMsg = error.response?.data?.message || error.message;
    console.error('Update failed:', errMsg);
    return repondre(`❌ Error: ${errMsg}`);
  }
});
