// --- antibot.js ---
require("dotenv").config();
const { Pool } = require("pg");
let s = require("../set");
var dbUrl = s.DATABASE_URL ? s.DATABASE_URL : "postgresql://flashmd_user:JlUe2Vs0UuBGh0sXz7rxONTeXSOra9XP@dpg-cqbd04tumphs73d2706g-a/flashmd";
const proConfig = {
  connectionString: dbUrl,
  ssl: {
    rejectUnauthorized: false,
  },
};
const pool = new Pool(proConfig);

// antibot
async function createAntibotTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS antibot (
        jid text PRIMARY KEY,
        etat text,
        action text
      );
    `);
    console.log("La table 'antibot' a été créée avec succès.");
  } catch (error) {
    console.error("Une erreur est survenue lors de la création de la table 'antibot':", error);
  } finally {
    client.release();
  }
}
createAntibotTable();

async function atbajouterOuMettreAJourJid(jid, etat) {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM antibot WHERE jid = $1', [jid]);
    const jidExiste = result.rows.length > 0;
    if (jidExiste) {
      await client.query('UPDATE antibot SET etat = $1 WHERE jid = $2', [etat, jid]);
    } else {
      await client.query('INSERT INTO antibot (jid, etat, action) VALUES ($1, $2, $3)', [jid, etat, 'supp']);
    }
    console.log(`JID ${jid} ajouté ou mis à jour avec succès dans la table 'antibot'.`);
  } catch (error) {
    console.error("Erreur lors de l'ajout ou de la mise à jour du JID dans la table ,", error);
  } finally {
    client.release();
  }
};

async function atbmettreAJourAction(jid, action) {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM antibot WHERE jid = $1', [jid]);
    const jidExiste = result.rows.length > 0;
    if (jidExiste) {
      await client.query('UPDATE antibot SET action = $1 WHERE jid = $2', [action, jid]);
    } else {
      await client.query('INSERT INTO antibot (jid, etat, action) VALUES ($1, $2, $3)', [jid, 'non', action]);
    }
    console.log(`Action mise à jour avec succès pour le JID ${jid} dans la table 'antibot'.`);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'action pour le JID dans la table  :", error);
  } finally {
    client.release();
  }
};

async function atbverifierEtatJid(jid) {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT etat FROM antibot WHERE jid = $1', [jid]);
    if (result.rows.length > 0) {
      const etat = result.rows[0].etat;
      return etat === 'oui';
    } else {
      return false;
    }
  } catch (error) {
    console.error("Erreur lors de la vérification de l'état du JID dans la table ", error);
    return false;
  } finally {
    client.release();
  }
};

async function atbrecupererActionJid(jid) {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT action FROM antibot WHERE jid = $1', [jid]);
    if (result.rows.length > 0) {
      const action = result.rows[0].action;
      return action;
    } else {
      return 'supp';
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de l'action du JID dans la table :", error);
    return 'supp';
  } finally {
    client.release();
  }
}

// --- antilien.js ---
async function createAntilienTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS antilien (
        jid text PRIMARY KEY,
        etat text,
        action text
      );
    `);
    console.log("La table 'antilien' a été créée avec succès.");
  } catch (error) {
    console.error("Une erreur est survenue lors de la création de la table 'antilien':", error);
  } finally {
    client.release();
  }
}
createAntilienTable();

async function antilienAjouterOuMettreAJourJid(jid, etat) {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM antilien WHERE jid = $1', [jid]);
    const jidExiste = result.rows.length > 0;
    if (jidExiste) {
      await client.query('UPDATE antilien SET etat = $1 WHERE jid = $2', [etat, jid]);
    } else {
      await client.query('INSERT INTO antilien (jid, etat, action) VALUES ($1, $2, $3)', [jid, etat, 'supp']);
    }
    console.log(`JID ${jid} ajouté ou mis à jour avec succès dans la table 'antilien'.`);
  } catch (error) {
    console.error("Erreur lors de l'ajout ou de la mise à jour du JID dans la table ,", error);
  } finally {
    client.release();
  }
};

async function antilienMettreAJourAction(jid, action) {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM antilien WHERE jid = $1', [jid]);
    const jidExiste = result.rows.length > 0;
    if (jidExiste) {
      await client.query('UPDATE antilien SET action = $1 WHERE jid = $2', [action, jid]);
    } else {
      await client.query('INSERT INTO antilien (jid, etat, action) VALUES ($1, $2, $3)', [jid, 'non', action]);
    }
    console.log(`Action mise à jour avec succès pour le JID ${jid} dans la table 'antilien'.`);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'action pour le JID dans la table  :", error);
  } finally {
    client.release();
  }
};

async function antilienVerifierEtatJid(jid) {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT etat FROM antilien WHERE jid = $1', [jid]);
    if (result.rows.length > 0) {
      const etat = result.rows[0].etat;
      return etat === 'oui';
    } else {
      return false;
    }
  } catch (error) {
    console.error("Erreur lors de la vérification de l'état du JID dans la table ", error);
    return false;
  } finally {
    client.release();
  }
};

async function antilienRecupererActionJid(jid) {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT action FROM antilien WHERE jid = $1', [jid]);
    if (result.rows.length > 0) {
      const action = result.rows[0].action;
      return action;
    } else {
      return 'supp';
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de l'action du JID dans la table :", error);
    return 'supp';
  } finally {
    client.release();
  }
}

// --- antiword.js ---
async function createAntiwordTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS antiword (
        jid text PRIMARY KEY,
        etat text,
        action text
      );
    `);
    console.log("La table 'antiword' a été créée avec succès.");
  } catch (error) {
    console.error("Une erreur est survenue lors de la création de la table 'antiword':", error);
  } finally {
    client.release();
  }
}
createAntiwordTable();

async function antiwordAjouterOuMettreAJourJid(jid, etat) {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM antiword WHERE jid = $1', [jid]);
    const jidExiste = result.rows.length > 0;
    if (jidExiste) {
      await client.query('UPDATE antiword SET etat = $1 WHERE jid = $2', [etat, jid]);
    } else {
      await client.query('INSERT INTO antiword (jid, etat, action) VALUES ($1, $2, $3)', [jid, etat, 'supp']);
    }
    console.log(`JID ${jid} ajouté ou mis à jour avec succès dans la table 'antiword'.`);
  } catch (error) {
    console.error("Erreur lors de l'ajout ou de la mise à jour du JID dans la table ,", error);
  } finally {
    client.release();
  }
};

async function antiwordMettreAJourAction(jid, action) {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM antiword WHERE jid = $1', [jid]);
    const jidExiste = result.rows.length > 0;
    if (jidExiste) {
      await client.query('UPDATE antiword SET action = $1 WHERE jid = $2', [action, jid]);
    } else {
      await client.query('INSERT INTO antiword (jid, etat, action) VALUES ($1, $2, $3)', [jid, 'non', action]);
    }
    console.log(`Action mise à jour avec succès pour le JID ${jid} dans la table 'antiword'.`);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'action pour le JID dans la table  :", error);
  } finally {
    client.release();
  }
};

async function antiwordVerifierEtatJid(jid) {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT etat FROM antiword WHERE jid = $1', [jid]);
    if (result.rows.length > 0) {
      const etat = result.rows[0].etat;
      return etat === 'oui';
    } else {
      return false;
    }
  } catch (error) {
    console.error("Erreur lors de la vérification de l'état du JID dans la table ", error);
    return false;
  } finally {
    client.release();
  }
};

async function antiwordRecupererActionJid(jid) {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT action FROM antiword WHERE jid = $1', [jid]);
    if (result.rows.length > 0) {
      const action = result.rows[0].action;
      return action;
    } else {
      return 'supp';
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de l'action du JID dans la table :", error);
    return 'supp';
  } finally {
    client.release();
  }
}

// --- banGroup.js ---
async function creerTableBanGroup() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS banGroup (
        groupeJid text PRIMARY KEY
      );
    `);
    console.log("La table 'banGroup' a été créée avec succès.");
  } catch (e) {
    console.error("Une erreur est survenue lors de la création de la table 'banGroup':", e);
  }
}
creerTableBanGroup();

async function addGroupToBanList(groupeJid) {
  const client = await pool.connect();
  try {
    const query = "INSERT INTO banGroup (groupeJid) VALUES ($1)";
    const values = [groupeJid];
    await client.query(query, values);
    console.log(`Groupe JID ${groupeJid} ajouté à la liste des groupes bannis.`);
  } catch (error) {
    console.error("Erreur lors de l'ajout du groupe banni :", error);
  } finally {
    client.release();
  }
}

async function isGroupBanned(groupeJid) {
  const client = await pool.connect();
  try {
    const query = "SELECT EXISTS (SELECT 1 FROM banGroup WHERE groupeJid = $1)";
    const values = [groupeJid];
    const result = await client.query(query, values);
    return result.rows[0].exists;
  } catch (error) {
    console.error("Erreur lors de la vérification du groupe banni :", error);
    return false;
  } finally {
    client.release();
  }
}

async function removeGroupFromBanList(groupeJid) {
  const client = await pool.connect();
  try {
    const query = "DELETE FROM banGroup WHERE groupeJid = $1";
    const values = [groupeJid];
    await client.query(query, values);
    console.log(`Groupe JID ${groupeJid} supprimé de la liste des groupes bannis.`);
  } catch (error) {
    console.error("Erreur lors de la suppression du groupe banni :", error);
  } finally {
    client.release();
  }
}

// --- banUser.js ---
async function creerTableBanUser() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS banUser (
        jid text PRIMARY KEY
      );
    `);
    console.log("La table 'banUser' a été créée avec succès.");
  } catch (e) {
    console.error("Une erreur est survenue lors de la création de la table 'banUser':", e);
  }
}
creerTableBanUser();

async function addUserToBanList(jid) {
  const client = await pool.connect();
  try {
    const query = "INSERT INTO banUser (jid) VALUES ($1)";
    const values = [jid];
    await client.query(query, values);
    console.log(`JID ${jid} ajouté à la liste des bannis.`);
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'utilisateur banni :", error);
  } finally {
    client.release();
  }
}

async function isUserBanned(jid) {
  const client = await pool.connect();
  try {
    const query = "SELECT EXISTS (SELECT 1 FROM banUser WHERE jid = $1)";
    const values = [jid];
    const result = await client.query(query, values);
    return result.rows[0].exists;
  } catch (error) {
    console.error("Erreur lors de la vérification de l'utilisateur banni :", error);
    return false;
  } finally {
    client.release();
  }
}

async function removeUserFromBanList(jid) {
  const client = await pool.connect();
  try {
    const query = "DELETE FROM banUser WHERE jid = $1";
    const values = [jid];
    await client.query(query, values);
    console.log(`JID ${jid} supprimé de la liste des bannis.`);
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur banni :", error);
  } finally {
    client.release();
  }
}

// --- cron.js ---
async function createTablecron() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS cron (
        group_id text PRIMARY KEY,
        mute_at text default null,
        unmute_at text default null
      );
    `);
    console.log("La table 'cron' a été créée avec succès.");
  } catch (error) {
    console.error("Une erreur est survenue lors de la création de la table 'cron':", error);
  } finally {
    client.release();
  }
}
createTablecron();

async function getCron() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM cron');
    return result.rows;
  } catch (error) {
    console.error('Erreur lors de la récupération des données de la table "cron":', error);
  } finally {
    client.release();
  }
}

async function addCron(group_id, rows, value) {
  const client = await pool.connect();
  try {
    let response = await client.query(`SELECT * FROM cron WHERE group_id = $1`, [group_id]);
    let exist = response.rows.length > 0;
    if (exist) {
      await client.query(`UPDATE cron SET ${rows} = $1 WHERE group_id = $2 `, [value, group_id]);
    } else {
      const query = `
        INSERT INTO cron (group_id, ${rows}) 
        VALUES ($1, $2)`;
      await client.query(query, [group_id, value]);
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la donnée dans la table "cron":', error);
  } finally {
    client.release();
  }
}

async function getCronById(group_id) {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM cron WHERE group_id = $1', [group_id]);
    return result.rows[0];
  } catch (error) {
    console.error('Erreur lors de la récupération des données de la table "cron":', error);
  } finally {
    client.release();
  }
}

async function delCron(group_id) {
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM cron WHERE group_id = $1', [group_id]);
  } catch (error) {
    console.error('Erreur lors de la suppression de la donnée dans la table "cron":', error);
  } finally {
    client.release();
  }
}

// --- hentai.js ---
async function creerTableHentai() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hentai (
        groupeJid text PRIMARY KEY
      );
    `);
    console.log("La table 'hentai' avec 'groupeJid' comme clé primaire a été créée avec succès.");
  } catch (e) {
    console.error("Une erreur est survenue lors de la création de la table 'hentai':", e);
  }
}
creerTableHentai();

async function addToHentaiList(groupeJid) {
  const client = await pool.connect();
  try {
    const query = "INSERT INTO hentai (groupeJid) VALUES ($1)";
    const values = [groupeJid];
    await client.query(query, values);
    console.log(`Le groupe JID ${groupeJid} a été ajouté à la liste de hentai.`);
  } catch (error) {
    console.error("Erreur lors de l'ajout du groupe à la liste de hentai :", error);
  } finally {
    client.release();
  }
}

async function checkFromHentaiList(groupeJid) {
  const client = await pool.connect();
  try {
    const query = "SELECT EXISTS (SELECT 1 FROM hentai WHERE groupeJid = $1)";
    const values = [groupeJid];
    const result = await client.query(query, values);
    return result.rows[0].exists;
  } catch (error) {
    console.error("Erreur lors de la vérification de la présence du groupe dans la liste de hentai :", error);
    return false;
  } finally {
    client.release();
  }
}

async function removeFromHentaiList(groupeJid) {
  const client = await pool.connect();
  try {
    const query = "DELETE FROM hentai WHERE groupeJid = $1";
    const values = [groupeJid];
    await client.query(query, values);
    console.log(`Le groupe JID ${groupeJid} a été supprimé de la liste de hentai.`);
  } catch (error) {
    console.error("Erreur lors de la suppression du groupe de la liste de hentai :", error);
  } finally {
    client.release();
  }
}

// --- level.js ---
async function createUsersRankTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users_rank (
        id SERIAL PRIMARY KEY,
        jid VARCHAR(255) UNIQUE,
        xp INTEGER DEFAULT 0,
        messages INTEGER DEFAULT 0
      );
    `);
  } catch (error) {
    console.error('Erreur lors de la création de la table users_rank:', error);
  } finally {
    client.release();
  }
}
createUsersRankTable();

async function ajouterOuMettreAJourUserData(jid) {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM users_rank WHERE jid = $1', [jid]);
    const jidExiste = result.rows.length > 0;
    if (jidExiste) {
      await client.query('UPDATE users_rank SET xp = xp + 10, messages = messages + 1 WHERE jid = $1', [jid]);
    } else {
      await client.query('INSERT INTO users_rank (jid, xp, messages) VALUES ($1, $2, $3)', [jid, 10, 1]);
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour des données de l\'utilisateur:', error);
  } finally {
    client.release();
  }
};

async function getMessagesAndXPByJID(jid) {
  const client = await pool.connect();
  try {
    const query = 'SELECT messages, xp FROM users_rank WHERE jid = $1';
    const result = await client.query(query, [jid]);
    if (result.rows.length > 0) {
      const { messages, xp } = result.rows[0];
      return { messages, xp };
    } else {
      return { messages: 0, xp: 0 };
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des données de l\'utilisateur:', error);
    return { messages: 0, xp: 0 };
  } finally {
    client.release();
  }
}

async function getBottom10Users() {
  const client = await pool.connect();
  try {
    const query = 'SELECT jid, xp , messages FROM users_rank ORDER BY xp DESC LIMIT 10';
    const result = await client.query(query);
    return result.rows;
  } catch (error) {
    console.error('Erreur lors de la récupération du bottom 10 des utilisateurs:', error);
    return [];
  } finally {
    client.release();
  }
}

// --- mention.js ---
async function creerTableMention() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS mention (
        id serial PRIMARY KEY,
        status text DEFAULT 'non',
        url text,
        type text,
        message text
      );
    `);
    console.log("La table 'mention' a été créée avec succès.");
  } catch (e) {
    console.error("Une erreur est survenue lors de la création de la table 'mention':", e);
  } finally {
    client.release();
  }
}
creerTableMention();

async function addOrUpdateDataInMention(url, type, message) {
  const client = await pool.connect();
  try {
    const query = `
      INSERT INTO mention (id, url, type, message)
      VALUES (1, $1, $2, $3)
      ON CONFLICT (id)
      DO UPDATE SET  url = excluded.url, type = excluded.type , message = excluded.message;
    `;
    const values = [url, type, message];
    await client.query(query, values);
    console.log("Données ajoutées ou mises à jour dans la table 'mention' avec succès.");
  } catch (error) {
    console.error("Erreur lors de l'ajout ou de la mise à jour des données dans la table 'mention':", error);
  } finally {
    client.release();
  }
};

async function modifierStatusId1(nouveauStatus) {
  const client = await pool.connect();
  try {
    const query = `
      UPDATE mention
      SET status = $1
      WHERE id = 1;
    `;
    const values = [nouveauStatus];
    await client.query(query, values);
    console.log("Le status a été modifié avec succès pour l'ID 1 dans la table 'mention'.");
  } catch (error) {
    console.error("Erreur lors de la modification du status pour l'ID 1 dans la table 'mention':", error);
  } finally {
    client.release();
  }
};

async function recupererToutesLesValeursMention() {
  const client = await pool.connect();
  try {
    const query = `
      SELECT * FROM mention;
    `;
    const result = await client.query(query);
    console.log("Voici toutes les valeurs de la table 'mention':", result.rows);
    return result.rows;
  } catch (error) {
    console.error("Erreur lors de la récupération des valeurs de la table 'mention':", error);
  } finally {
    client.release();
  }
}

// --- onlyAdmin.js ---
async function creerTableOnlyAdmin() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS onlyAdmin (
        groupeJid text PRIMARY KEY
      );
    `);
    console.log("La table 'onlyAdmin' a été créée avec succès.");
  } catch (e) {
    console.error("Une erreur est survenue lors de la création de la table 'onlyAdmin':", e);
  }
}
creerTableOnlyAdmin();

async function addGroupToOnlyAdminList(groupeJid) {
  const client = await pool.connect();
  try {
    const query = "INSERT INTO onlyAdmin (groupeJid) VALUES ($1)";
    const values = [groupeJid];
    await client.query(query, values);
    console.log(`Groupe JID ${groupeJid} ajouté à la liste des groupes onlyAdmin.`);
  } catch (error) {
    console.error("Erreur lors de l'ajout du groupe onlyAdmin :", error);
  } finally {
    client.release();
  }
}

async function isGroupOnlyAdmin(groupeJid) {
  const client = await pool.connect();
  try {
    const query = "SELECT EXISTS (SELECT 1 FROM onlyAdmin WHERE groupeJid = $1)";
    const values = [groupeJid];
    const result = await client.query(query, values);
    return result.rows[0].exists;
  } catch (error) {
    console.error("Erreur lors de la vérification du groupe onlyAdmin :", error);
    return false;
  } finally {
    client.release();
  }
}

async function removeGroupFromOnlyAdminList(groupeJid) {
  const client = await pool.connect();
  try {
    const query = "DELETE FROM onlyAdmin WHERE groupeJid = $1";
    const values = [groupeJid];
    await client.query(query, values);
    console.log(`Groupe JID ${groupeJid} supprimé de la liste des groupes onlyAdmin.`);
  } catch (error) {
    console.error("Erreur lors de la suppression du groupe onlyAdmin :", error);
  } finally {
    client.release();
  }
}

// Export any necessary functions as needed (edit as suits your app)
module.exports = {
  // antibot
  atbajouterOuMettreAJourJid,
  atbmettreAJourAction,
  atbverifierEtatJid,
  atbrecupererActionJid,
  // antilien
  antilienAjouterOuMettreAJourJid,
  antilienMettreAJourAction,
  antilienVerifierEtatJid,
  antilienRecupererActionJid,
  // antiword
  antiwordAjouterOuMettreAJourJid,
  antiwordMettreAJourAction,
  antiwordVerifierEtatJid,
  antiwordRecupererActionJid,
  // banGroup
  addGroupToBanList,
  isGroupBanned,
  removeGroupFromBanList,
  // banUser
  addUserToBanList,
  isUserBanned,
  removeUserFromBanList,
  // cron
  getCron,
  addCron,
  delCron,
  getCronById,
  // hentai
  addToHentaiList,
  checkFromHentaiList,
  removeFromHentaiList,
  // level
  ajouterOuMettreAJourUserData,
  getMessagesAndXPByJID,
  getBottom10Users,
  // mention
  addOrUpdateDataInMention,
  recupererToutesLesValeursMention,
  modifierStatusId1,
  // onlyAdmin
  addGroupToOnlyAdminList,
  isGroupOnlyAdmin,
  removeGroupFromOnlyAdminList
};
